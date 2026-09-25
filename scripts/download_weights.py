import os
import urllib.request


def download_file(url, dest):
    print(f"Downloading {url} to {dest}")
    urllib.request.urlretrieve(url, dest)
    print("Download complete.")


if __name__ == "__main__":
    os.makedirs("weights", exist_ok=True)
    print("Run download commands here.")
