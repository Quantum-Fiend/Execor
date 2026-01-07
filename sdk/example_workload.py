from hydra.client import HydraClient, job
import time

client = HydraClient()

# 1. Simple Shell Job
client.submit_job("echo 'Hello Dist Sys'", job_type="BATCH")

# 2. Advanced Python Job Definition
@job(cpu=4, memory="4GB", retries=5)
def analyze_data(dataset_path):
    print(f"Processing data at {dataset_path}...")
    time.sleep(2)
    # Simulate work
    return {"status": "success", "rows": 10000}

# Execute (Interception happens here)
result = analyze_data("s3://bucket/data.csv")
print("Result:", result)
