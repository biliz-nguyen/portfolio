# Unitree LiDAR L1 — ROS 2 Humble & Point-LIO

**UNITREE L1 / ROS 2 / POINT CLOUD / SLAM**

## 01 / Overview

This is my personal setup and testing project for the **Unitree LiDAR L1**. I used it to explore sensor data with **ROS 2 Humble** and **RViz2**, and to try the **Point-LIO** mapping workflow.

The original project is published on my other account: [Unitree-Lidar-L1-SLAM](https://github.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM).

**Author:** Biliz Nguyen (NguyenLeMinh-dev).

This project focuses on sensor setup, running the driver and visualizing point clouds. It was not a machine-learning training project or a quantitative SLAM benchmark.

## 02 / Software requirements

- Unitree LiDAR L1
- Ubuntu 22.04 LTS
- ROS 2 Humble
- Colcon build tools
- RViz2
- Unitree LiDAR ROS 2 driver
- Point-LIO ROS 2 port (for mapping)

## 03 / Install ROS 2 Humble

First install ROS 2 Humble using the [official Ubuntu instructions](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html). After installation, open a terminal:

~~~bash
source /opt/ros/humble/setup.bash
echo "$ROS_DISTRO"
sudo apt install python3-colcon-common-extensions
~~~

The expected ROS distribution is `humble`. To load it in new terminals automatically, add the source command to your shell configuration.

## 04 / Run the Unitree LiDAR L1

The original tutorial used a standalone driver clone URL that may no longer be available. The ROS 2 driver is available in the [official Unitree SDK repository](https://github.com/unitreerobotics/unilidar_sdk). A starting layout is:

~~~bash
git clone https://github.com/unitreerobotics/unilidar_sdk.git
cd unilidar_sdk/unitree_lidar_ros2
source /opt/ros/humble/setup.bash
colcon build --symlink-install
source install/setup.bash
~~~

The official driver documentation lists a ROS 2 Foxy environment; this project used Humble, so dependency and build compatibility should be checked against the actual SDK version.

Check the connected serial interface and the launch configuration:

~~~bash
ls /dev/ttyUSB*
ros2 launch unitree_lidar_ros2 launch.py
~~~

Inspect the ROS 2 messages:

~~~bash
ros2 topic list
ros2 topic info /unilidar/cloud
ros2 topic hz /unilidar/cloud
ros2 topic echo /unilidar/imu --once
~~~

The default topics in the referenced driver and Point-LIO configuration include `/unilidar/cloud` and `/unilidar/imu`.

## 05 / Visualize the point cloud with RViz2

From the driver workspace, open the included RViz2 configuration:

~~~bash
rviz2 -d src/unitree_lidar_ros2/rviz/view.rviz
~~~

In RViz2, select the correct point cloud topic and **Fixed Frame**. This is the first practical check for the LiDAR stream and how the environment appears in 3D.

![Unitree LiDAR L1 point-cloud view](https://raw.githubusercontent.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM/main/docs/images/lidar_unitree_l1.png)

*Unitree L1 point-cloud visualization — image from my original repository.*

## 06 / Point-LIO — SLAM setup

I also explored the [Point-LIO ROS 2 port](https://github.com/dfloreaa/point_lio_ros2) with the Unitree L1. The workspace and launch flow are:

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

Run the LiDAR driver in a separate terminal and check the configuration for the sensor. Important parameters in [`unilidar_l1.yaml`](https://github.com/dfloreaa/point_lio_ros2/blob/main/config/unilidar_l1.yaml) include:

- `lid_topic` / `imu_topic`: ROS 2 input topics.
- `time_lag_imu_to_lidar`: LiDAR–IMU timing offset.
- `extrinsic_T` / `extrinsic_R`: LiDAR–IMU extrinsic calibration.
- `timestamp_unit`: point-cloud timestamp unit.

![SLAM visualization from my Unitree L1 project](https://raw.githubusercontent.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM/main/docs/images/lidar_fastLIO.png)

*SLAM visualization — original project screenshot. The filename contains `fastLIO`, so the exact algorithm behind this figure is not labeled as a measured Point-LIO result.*

## 07 / ROS 2 in WSL (optional)

For Windows with WSL, my original tutorial also describes USB forwarding through **usbipd-win**. In administrator PowerShell:

~~~powershell
winget install --id dorssel.usbipd-win -e
usbipd list
usbipd bind --busid YOUR_BUS_ID
usbipd attach --wsl --busid YOUR_BUS_ID
~~~

Then check from WSL:

~~~bash
ls /dev/ttyUSB*
~~~

Replace `YOUR_BUS_ID` with the real identifier returned by `usbipd list`. Use this step only for WSL-based setups.

## 08 / Results

Through this project I tested the LiDAR setup and explored ROS 2 point-cloud and SLAM visualization. The screenshots above document that stage of the work.

I did **not** train an AI model using this LiDAR data, and I did not publish trajectory accuracy, ATE/RPE or other quantitative mapping metrics. The focus was getting the sensor pipeline running and understanding the workflow.

## 09 / References

- [My original Unitree-Lidar-L1-SLAM repository](https://github.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM)
- [Official Unitree SDK](https://github.com/unitreerobotics/unilidar_sdk)
- [Point-LIO ROS 2 port](https://github.com/dfloreaa/point_lio_ros2)
- [Point-LIO research repository](https://github.com/hku-mars/Point-LIO)
- [ROS 2 Humble installation](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html)
