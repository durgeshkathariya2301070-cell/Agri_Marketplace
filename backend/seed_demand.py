import os
import pandas as pd

from database import SessionLocal
from models import DemandData


# ================================
# SETTINGS
# ================================

DATASET_FOLDER = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "dataset",
    "archive"
)

CHUNK_SIZE = 100000

# Start with only 5 files for testing
MAX_FILES = None


# Use historical data from 2021 onwards
START_DATE = pd.Timestamp("2021-01-01")

# Model should have at least 30 historical records
MIN_HISTORY_RECORDS = 30

# Remove the old manually-created seed data
REPLACE_EXISTING_DATA = True


# ================================
# REQUIRED CSV COLUMNS
# ================================

REQUIRED_COLUMNS = [
    "District Name",
    "Market Name",
    "Arrivals",
    "Reported Date"
]


# ================================
# PROCESS ONE CSV FILE
# ================================

def process_csv(filepath):

    filename = os.path.basename(filepath)

    product = os.path.splitext(filename)[0].strip().lower()

    print()
    print("Processing:", filename)

    # Read only the header first
    try:
        header = pd.read_csv(
            filepath,
            nrows=0
        )
    except pd.errors.EmptyDataError:
        print("Skipping empty CSV file.")
        return pd.DataFrame()

    columns = header.columns.tolist()

    # Different files use different names
    if "Arrivals (Tonnes)" in columns:
        arrivals_column = "Arrivals (Tonnes)"

    elif "Arrivals" in columns:
        arrivals_column = "Arrivals"

    else:
        print(
            "Skipping file - arrivals column not found."
        )
        return pd.DataFrame()

    required_columns = [
        "District Name",
        "Market Name",
        arrivals_column,
        "Reported Date"
    ]

    parts = []

    for chunk in pd.read_csv(
        filepath,
        usecols=required_columns,
        chunksize=CHUNK_SIZE,
        low_memory=False
    ):

        # Convert date
        chunk["date"] = pd.to_datetime(
            chunk["Reported Date"],
            errors="coerce"
        )

        # Convert arrivals to number
        chunk["quantity"] = pd.to_numeric(
            chunk[arrivals_column],
            errors="coerce"
        )

        # Use district as location
        # If district is missing, use market
        chunk["location"] = (
            chunk["District Name"]
            .fillna(chunk["Market Name"])
            .astype("string")
            .str.strip()
            .str.lower()
        )

        # Remove invalid rows
        chunk = chunk[
            chunk["date"].notna()
            & chunk["quantity"].notna()
            & (chunk["quantity"] > 0)
            & chunk["location"].notna()
            & (chunk["location"] != "")
        ]

        # Keep historical data from 2021 onwards
        chunk = chunk[
            chunk["date"] >= START_DATE
        ]

        if chunk.empty:
            continue

        # Keep the original agricultural quantity in tonnes.
        # This avoids extremely large kilogram values.
        chunk["quantity_sold"] = (
            chunk["quantity"]
        ).round().astype("int64")

        # Combine multiple markets/varieties
        daily = (
            chunk
            .groupby(
                ["location", "date"],
                as_index=False
            )["quantity_sold"]
            .sum()
        )

        daily["product"] = product

        parts.append(daily)

    if not parts:

        print("No usable data found.")

        return pd.DataFrame()

    result = pd.concat(
        parts,
        ignore_index=True
    )

    # Combine duplicate product/location/date records
    result = (
        result
        .groupby(
            ["product", "location", "date"],
            as_index=False
        )["quantity_sold"]
        .sum()
    )

    # Keep only locations with enough history
    counts = (
        result
        .groupby(
            ["product", "location"]
        )
        .size()
        .reset_index(name="records")
    )

    valid_locations = counts[
        counts["records"] >= MIN_HISTORY_RECORDS
    ][
        ["product", "location"]
    ]

    result = result.merge(
        valid_locations,
        on=["product", "location"],
        how="inner"
    )

    print(
        "Usable historical records:",
        len(result)
    )

    return result


# ================================
# MAIN IMPORT
# ================================

def main():

    if not os.path.exists(DATASET_FOLDER):

        print("Dataset folder not found:")
        print(DATASET_FOLDER)
        return

    files = sorted([
        filename
        for filename in os.listdir(DATASET_FOLDER)
        if filename.lower().endswith(".csv")
    ])

    print()
    print("CSV files found:", len(files))

    if MAX_FILES is not None:
        files = files[:MAX_FILES]

    print(
        "CSV files being processed:",
        len(files)
    )

    db = SessionLocal()

    try:

        # Remove old developer seed data
        if REPLACE_EXISTING_DATA:

            deleted = (
                db.query(DemandData).delete()
            )

            db.commit()

            print(
                "Old DemandData records removed:",
                deleted
            )

        total_inserted = 0

        for filename in files:

            filepath = os.path.join(
                DATASET_FOLDER,
                filename
            )

            data = process_csv(filepath)

            if data.empty:
                continue

            records = []

            for row in data.itertuples(
                index=False
            ):

                records.append(
                    DemandData(
                        product=row.product,
                        location=row.location,
                        date=row.date.strftime(
                            "%Y-%m-%d"
                        ),
                        quantity_sold=int(
                            row.quantity_sold
                        )
                    )
                )

            # Insert in batches
            batch_size = 5000

            for start in range(
                0,
                len(records),
                batch_size
            ):

                batch = records[
                    start:start + batch_size
                ]

                db.add_all(batch)
                db.commit()

                total_inserted += len(batch)

        print()
        print("==============================")
        print("IMPORT COMPLETED")
        print("==============================")
        print(
            "Total records inserted:",
            total_inserted
        )

    finally:

        db.close()


if __name__ == "__main__":
    main()
