import requests

url = "https://issai.nu.edu.kz/wp-content/themes/issai-new/data/models/Nutrition5k/yolov8m.pt"
output_path = r"D:\Desktop\ingredient_api\yolov8m_nutrition5k.pt"

r = requests.get(url, stream=True)
with open(output_path, "wb") as f:
    for chunk in r.iter_content(chunk_size=8192):
        f.write(chunk)

print("Downloaded model to", output_path)


