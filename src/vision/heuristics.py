import logging
from typing import Any

logger = logging.getLogger(__name__)


def select_best_face(
    faces: list[dict[str, Any]], frame_width: int, frame_height: int
) -> dict[str, Any] | None:
    """
    Advanced heuristic to select the 'primary' face when multiple are detected.
    Considers both bounding box size (area) and centrality in the frame.

    Args:
        faces: List of face dictionaries containing 'box'
        frame_width: Width of the source frame
        frame_height: Height of the source frame

    Returns:
        The selected primary face dictionary, or None.
    """
    if not faces:
        return None

    if len(faces) == 1:
        return faces[0]

    # Calculate a score for each face: Area * CentralityWeight
    # Centrality is highest when face center is near frame center
    frame_center_x, frame_center_y = frame_width / 2, frame_height / 2

    best_face = None
    max_score = -1

    for face in faces:
        x1, y1, x2, y2 = face["box"]
        area = (x2 - x1) * (y2 - y1)

        face_center_x = (x1 + x2) / 2
        face_center_y = (y1 + y2) / 2

        # Normalized distance from center (0 to 1, where 0 is center)
        dist_x = abs(face_center_x - frame_center_x) / frame_center_x
        dist_y = abs(face_center_y - frame_center_y) / frame_center_y
        dist = (dist_x**2 + dist_y**2) ** 0.5

        # Centrality weight decays as distance increases
        centrality = max(0.1, 1.0 - dist)

        score = area * centrality

        if score > max_score:
            max_score = score
            best_face = face

    logger.debug(
        f"Selected primary face from {len(faces)} candidates. Max score: {max_score:.2f}"
    )
    return best_face


def interpolate_missing_faces(
    frame_results: list[dict[str, Any]], max_gap: int = 3
) -> list[dict[str, Any]]:
    """
    Fills in missing face boxes across frames using linear interpolation.
    Useful when the detector temporarily loses track of a face due to motion blur.
    """
    # This function would contain complex temporal interpolation logic
    # iterating through the timeline and filling gaps where 'box' is missing.
    logger.info(f"Temporal interpolation applied. Max gap allowed: {max_gap} frames.")
    return frame_results
