from pathlib import Path

from PIL import Image

src_base = Path(
    r"C:\Users\leonardo.scabora\.cursor\projects\c-Users-leonardo-scabora-FEMA-TCC-DESENVOLVIMENTO-FRONT\assets"
)
dest = Path(
    r"C:\Users\leonardo.scabora\FEMA\TCC\DESENVOLVIMENTO\FRONT\rei_do_codigo\public\game\knight"
)
dest.mkdir(parents=True, exist_ok=True)

mapping = {
    "Idle-0e987fa4-ad9e-4544-9a40-10d497bfcbc1.png": "idle.png",
    "Hurt-c5f4e42e-3cc1-4ad6-9368-b380974c1e35.png": "hurt.png",
    "Walk-90b4fc04-4f74-4696-837c-1cc05ae7f6e6.png": "walk.png",
    "Jump-3b0f4f62-a2aa-46db-add3-d819ff5a677d.png": "jump.png",
    "Run_Attack-eabc6248-1c34-4dc9-b26d-e56655fe6e21.png": "run-attack.png",
    "Attack_2-89d9b414-70b4-4da8-863f-70c7c4878353.png": "attack-2.png",
}
prefix = "c__Users_leonardo.scabora_AppData_Roaming_Cursor_User_workspaceStorage_9a7eb6fea7a96ff900d71aee87348b39_images_"


def is_background(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return True
    # Preto puro do sheet original.
    return r == 0 and g == 0 and b == 0


for src_name, out_name in mapping.items():
    src = src_base / f"{prefix}{src_name}"
    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    opaque = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if is_background(r, g, b, a):
                pixels[x, y] = (0, 0, 0, 0)
            else:
                opaque += 1
                pixels[x, y] = (r, g, b, 255)
    out = dest / out_name
    img.save(out)
    print(f"{out_name} {w}x{h} opaque={opaque}")
