# Unitree LiDAR L1 — ROS 2 & Point-LIO

**PERSONAL LAB LOG / UNITREE_L1 / ROS2 / SLAM**

> **DRAFT / NEEDS REVIEW.** This article is based on the publicly available tutorial repository. The commands and screenshots have not been independently tested with the physical sensor while preparing this portfolio entry.

## 01 / Why this experiment matters

A robotics perception pipeline begins with trustworthy sensor data. Before asking whether LiDAR–inertial odometry or SLAM is accurate, we need to confirm that the LiDAR publishes correctly, that its IMU is accessible, and that timestamps and coordinate frames are consistent.

In this article, I revisit my [Unitree-Lidar-L1-SLAM project](https://github.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM), a ROS 2 setup tutorial for the **Unitree LiDAR L1**. The README covers Ubuntu 22.04, ROS 2 Humble, Colcon, RViz2, a Point-LIO ROS 2 workflow and optional WSL USB forwarding.

**Project author: Biliz Nguyen.** This is my personal LiDAR setup and SLAM learning project, published from my other GitHub account, [NguyenLeMinh-dev](https://github.com/NguyenLeMinh-dev). I wrote and maintained the source tutorial. This review organizes my work as a technical learning log while separating documented setup instructions from independently validated experimental results.

## 02 / System and data flow

- Unitree LiDAR L1 produces raw range and inertial measurements.
- The Unitree ROS 2 package decodes and publishes point cloud and IMU messages.
- RViz2 helps inspect coverage, geometry and reference frames.
- Point-LIO processes LiDAR and IMU inputs for LiDAR–inertial motion estimation and mapping.
- Reliable conclusions require recorded data, calibration, repeatable test conditions and evaluation.

This repository records my **setup and visualization workflow**. I have not published a quantitative SLAM benchmark in it, so I keep screenshots separate from accuracy claims.

## 03 / Environment and prerequisites

- **Hardware:** Unitree LiDAR L1; exact firmware, mounting orientation and computer specification to be confirmed.
- **Documented OS:** Ubuntu 22.04 LTS.
- **Documented ROS:** ROS 2 Humble; Colcon workspace.
- **Tools:** RViz2, Unitree ROS 2 driver, Point-LIO ROS 2 port.
- **Optional host configuration:** Windows Subsystem for Linux with usbipd-win.

**Compatibility warning:** The official Unitree driver README documents Ubuntu 20.04 with ROS 2 Foxy as its verified setup. The linked personal tutorial targets Humble, so Humble compatibility must be checked on the actual workstation.

## 04 / Preparing ROS 2

Install ROS 2 from the [official ROS 2 Humble guide](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html). After installation:

~~~bash
source /opt/ros/humble/setup.bash
echo "$ROS_DISTRO"
sudo apt install python3-colcon-common-extensions
~~~

Expected distribution name: **humble**.

My original tutorial contains a clone URL for a standalone package under a Unitree account that is no longer accessible in this review. The official SDK instead contains the ROS 2 package under its own repository tree.

## 05 / Unitree driver: build and visualize

This is the **official SDK layout**, not a claim that the commands were newly tested for this article:

~~~bash
git clone https://github.com/unitreerobotics/unilidar_sdk.git
cd unilidar_sdk/unitree_lidar_ros2
source /opt/ros/humble/setup.bash
colcon build --symlink-install
source install/setup.bash
~~~

Check which serial interface is connected and verify the parameter in the driver's launch file:

~~~bash
ls /dev/ttyUSB*
ros2 launch unitree_lidar_ros2 launch.py
~~~

The official driver documentation uses **/dev/ttyUSB0** as its default serial interface, but the real path may differ.

Typical default ROS 2 topics and frames documented by Unitree:

- **Point cloud topic:** /unilidar/cloud
- **LiDAR frame:** unilidar_lidar
- **IMU topic:** /unilidar/imu
- **IMU frame:** unilidar_imu

Confirm the topics actually published in your setup:

~~~bash
ros2 topic list
ros2 topic info /unilidar/cloud
ros2 topic hz /unilidar/cloud
ros2 topic echo /unilidar/imu --once
~~~

Open the supplied RViz2 configuration from the Unitree driver workspace:

~~~bash
rviz2 -d src/unitree_lidar_ros2/rviz/view.rviz
~~~

If nothing appears, inspect the RViz **Fixed Frame**, PointCloud2 topic, QoS settings and any missing TF transform before concluding the driver is broken.

![Unitree LiDAR L1 point-cloud visualization from the original repository](https://raw.githubusercontent.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM/main/docs/images/lidar_unitree_l1.png)

*Figure 1 — RViz2 screenshot provided in the source project's LiDAR setup section; not a calibrated measurement.*

## 06 / Point-LIO integration

The tutorial also introduces **Point-LIO**, a LiDAR–inertial odometry and mapping pipeline. The referenced [ROS 2 port](https://github.com/dfloreaa/point_lio_ros2) contains a Unitree L1 launch file and configuration.

For an isolated Point-LIO workspace, the source workflow can be expressed as:

~~~bash
source /opt/ros/humble/setup.bash
sudo apt install ros-humble-pcl-ros ros-humble-pcl-conversions \
  ros-humble-visualization-msgs libeigen3-dev

mkdir -p ~/point_lio_ws/src
cd ~/point_lio_ws/src
git clone https://github.com/dfloreaa/point_lio_ros2.git
cd ~/point_lio_ws
colcon build --symlink-install
source install/setup.bash
ros2 launch point_lio mapping_unilidar_l1.launch.py
~~~

**Important:** Start the sensor driver separately, then check the actual Point-LIO input and output topics. Successful node startup does not automatically mean that SLAM is producing correct motion estimates.

The port's Unitree L1 YAML file defines:

- **lid_topic:** /unilidar/cloud
- **imu_topic:** /unilidar/imu
- **time_lag_imu_to_lidar:** a parameter for the LiDAR/IMU timing offset.
- **extrinsic_T** and **extrinsic_R:** a translation and rotation between sensor frames.
- **timestamp_unit**, **blind**, and other preprocessing/mapping parameters.

These are configuration values to **inspect and calibrate**, not universal ground-truth values for every device mounting configuration.

![Mapping visualization included in the original Unitree L1 repository](https://raw.githubusercontent.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM/main/docs/images/lidar_fastLIO.png)

*Figure 2 — Image appears in the source README's Point-LIO results section, but the filename contains fastLIO. Confirm the algorithm and run conditions before labeling it as a validated Point-LIO experiment.*

## 07 / WSL USB passthrough: optional setup

I also documented using **usbipd-win** to forward a USB device into WSL. On Windows PowerShell with the required privileges:

~~~powershell
winget install --id dorssel.usbipd-win -e
usbipd list
usbipd bind --busid YOUR_BUS_ID
usbipd attach --wsl --busid YOUR_BUS_ID
~~~

Replace YOUR_BUS_ID with a real value listed by usbipd, then confirm the device within WSL:

~~~bash
ls /dev/ttyUSB*
~~~

This option is only relevant when using WSL. Connection behavior, permissions and available interfaces depend on the host setup.

## 08 / What is supported by the available evidence?

**Present in the repository:** ROS 2 setup instructions, build/launch commands, RViz point-cloud screenshot, a mapping screenshot, references to upstream software and WSL USB notes.

**Not present in the reviewed repository tree:** a published sensor log or ROS bag, an annotated trajectory, calibration report, quantitative drift/ATE/RPE values, a reproducible benchmark or measured computation latency.

Consequently, any statement about Point-LIO being more accurate than alternative algorithms is **not a measured conclusion of this repository**. The image shows a visualization, not a numerical validation.

## 09 / What I would measure next

1. **Data integrity:** timestamps, message rate, missing frames and point count per scan.
2. **Geometry:** known-distance checks, coordinate frames and field-of-view coverage.
3. **LiDAR–IMU integration:** extrinsic rotation/translation, timing offset and initialization behavior.
4. **Trajectory quality:** inspect stationary, straight-line, rotating and closed-loop motions.
5. **Evaluation:** use ground-truth reference when available; calculate ATE/RPE or a justified alternative metric.
6. **Reproducibility:** preserve raw recordings, package versions, YAML parameters and command logs.

The research lesson is simple: **a visually plausible point cloud or map is a milestone, not the final evidence.**

## 10 / Review checklist before publication

- [ ] Confirm the exact hardware revision, firmware, computer model and ROS 2 environment.
- [ ] Verify which SDK clone URL and commands were used successfully.
- [ ] Confirm topics, frame names, LiDAR–IMU calibration and timing offsets.
- [ ] Confirm whether Figure 2 shows Point-LIO, FAST-LIO or another pipeline.
- [ ] Add raw data, a short demo/video and any reproducible launch configuration.
- [ ] Add quantitative results **only after** you can verify how they were obtained.
- [ ] Review contributor credit and the relationship to other projects.

## 11 / Source links

- [Original tutorial — NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM](https://github.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM)
- [Official Unitree unilidar SDK](https://github.com/unitreerobotics/unilidar_sdk)
- [Official Unitree ROS 2 driver documentation](https://github.com/unitreerobotics/unilidar_sdk/blob/main/unitree_lidar_ros2/src/unitree_lidar_ros2/README.md)
- [Point-LIO ROS 2 port](https://github.com/dfloreaa/point_lio_ros2)
- [Unitree L1 Point-LIO configuration](https://github.com/dfloreaa/point_lio_ros2/blob/main/config/unilidar_l1.yaml)
- [Point-LIO research repository](https://github.com/hku-mars/Point-LIO)
- [ROS 2 Humble official installation](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html)

*Editorial note: Personal research log, drafted for review on 2 November 2026 from my source repository. The hardware was not independently retested while writing this portfolio article.*
