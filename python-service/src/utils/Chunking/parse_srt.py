import re

def parse_srt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # split into individual subtitle blocks
    blocks = content.strip().split("\n\n")

    subtitles = []
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue

        # line 0 is the number, line 1 is the timestamp, rest is text
        timestamp = lines[1]
        text = " ".join(lines[2:])

        # extract start time
        start = timestamp.split(" --> ")[0].strip()
        start = start.replace(",", ".")  # make it clean

        subtitles.append({"start": start, "text": text})

    return subtitles


def group_into_chunks(subtitles, chunk_seconds=60):
    chunks = []
    current_text = []
    current_start = subtitles[0]["start"]

    def time_to_seconds(t):
        h, m, s = t.split(":")
        return int(h) * 3600 + int(m) * 60 + float(s)

    start_time = time_to_seconds(current_start)

    for sub in subtitles:
        current_time = time_to_seconds(sub["start"])

        if current_time - start_time >= chunk_seconds:
            # save current chunk
            chunks.append({
                "start": current_start,
                "end": sub["start"],
                "text": " ".join(current_text)
            })
            # start new chunk
            current_start = sub["start"]
            start_time = current_time
            current_text = []

        current_text.append(sub["text"])

    # save last chunk
    if current_text:
        chunks.append({
            "start": current_start,
            "end": subtitles[-1]["start"],
            "text": " ".join(current_text)
        })

    return chunks


if __name__ == "__main__":
    # simple manual test helper, not run when imported
    subtitles = parse_srt("./transcript.srt")
    chunks = group_into_chunks(subtitles, chunk_seconds=60)

    for chunk in chunks:
        print(f"{chunk['start']} → {chunk['end']}")
        print(f"{chunk['text'][:80]}...")
        print()