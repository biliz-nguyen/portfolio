# LiDAR perception for rubber-tree structure

## Research question

How can 3D laser measurements support measurements of rubber-tree height, stem structure and canopy geometry? This is a **proposed research direction**, not an assertion that an experiment has already been completed.

## Physics of range sensing

LiDAR measures the travel time of emitted and reflected light, or uses other ranging methods depending on the instrument. For pulsed time-of-flight LiDAR:

```text
distance = c * delta_t / 2
```

where `c` is light speed, `delta_t` is round-trip time, and the factor of two accounts for the outgoing and returning paths. Sensor geometry transforms range and angles into a 3D point.

## Pipeline

1. Collect point clouds with known spatial reference and sensor calibration.
2. Remove outliers and identify ground points.
3. Normalize heights relative to the local ground model.
4. Segment individual tree objects.
5. Estimate tree height as canopy top relative to ground; account for occlusions.
6. Fit stem models where trunk points have sufficient coverage.
7. Quantify uncertainty and compare with field measurements.

## Example: a basic height estimate

```python
import numpy as np
ground_height = 1.2
points_z = np.array([1.2, 1.3, 4.0, 7.1, 8.5])
height_estimate = points_z.max() - ground_height
print(height_estimate) # 7.3 meters
```

The numbers above are **synthetic**. Real analyses need proper ground segmentation, coordinate alignment, completeness checks and field validation.

## Open questions

- How much does canopy occlusion bias estimated height?
- Can trunk diameter be estimated from airborne LiDAR, or is terrestrial scanning necessary?
- What changes across seasons, foliage densities and survey altitudes?
- Can machine learning improve segmentation without requiring extensive labels?

## What I learned

Accurate geometry requires more than a point cloud visualization. Every measured attribute needs an explicit definition, uncertainty estimate and validation method.
