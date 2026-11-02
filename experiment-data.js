/**
 * Experiment notebook metadata. These are editable workflows/learning tracks.
 * Do not treat unfilled placeholders as evidence of completed experiments.
 */
window.EXPERIMENT_LOGS = [
  {
    slug:"unitree-lidar",number:"001",type:"SENSING / SLAM",title:"Unitree LiDAR L1 — ROS 2 & Point-LIO",
    summary:"ROS 2 driver setup, LiDAR point-cloud visualization, Point-LIO integration and practical validation notes, drawn from the original project documentation.",
    status:"DRAFT / REVIEW",scope:"LiDAR / IMU / ROS 2",
    objective:"Document the Unitree LiDAR L1 and Point-LIO tutorial, identifying verified sources and research questions that still require testing.",
    questions:["How do ROS 2 point cloud and IMU topics connect to a SLAM pipeline?","What timing and extrinsic calibration parameters must be checked?","What evidence is missing before claiming localization accuracy?"],
    setup:["Unitree LiDAR L1","Ubuntu 22.04 with ROS 2 Humble, RViz2 and Colcon (source tutorial)","Unitree ROS 2 driver and Point-LIO ROS 2 port"],
    workflow:[["Driver","Inspect serial connection and stream messages."],["Visualization","View and validate the point cloud in RViz2."],["Integration","Configure Point-LIO with correct input topics and extrinsics."],["Review","Assess the screenshots, missing dataset and future benchmark plan."]],
    data:"The source repository includes two screenshots but no public experiment dataset in its root tree.",
    results:"No numerical SLAM accuracy or repeated evaluation is documented by the available source.",
    lessons:"Record assumptions about frame transforms, clock synchronization, hardware setup and evaluation methodology.",
    notes:[["LiDAR perception and rubber trees","note.html?slug=lidar-rubber-trees"]],
    links:[["Original Unitree L1 SLAM tutorial","https://github.com/NguyenLeMinh-dev/Unitree-Lidar-L1-SLAM"],["Official Unitree SDK","https://github.com/unitreerobotics/unilidar_sdk"],["Point-LIO ROS 2","https://github.com/dfloreaa/point_lio_ros2"]]

  },
  {
    slug:"drone-flight",number:"002",type:"FLIGHT",title:"Drone Flight Tests",
    summary:"Explore flight telemetry, quadrotor dynamics, estimation and experimental validation.",
    status:"DOCUMENTING",scope:"Aerial system",
    objective:"Build a transparent flight-test record connecting sensor logs to a physical model of quadrotor motion.",
    questions:[
      "How well do recorded actuator inputs explain motion and angular-rate changes?",
      "Which reference frames, units and synchronization steps are needed?",
      "What model errors become visible across different flight maneuvers?"
    ],
    setup:[
      "Flight platform, motor/propeller configuration and mass — add the exact tested setup",
      "Telemetry channels: IMU, attitude, pose and motor or control commands",
      "Logging rate, timestamps, calibration and safety constraints"
    ],
    workflow:[
      ["Prepare","Record vehicle parameters, units and test conditions."],
      ["Capture","Log safe, repeatable flight or bench-test sequences."],
      ["Synchronize","Align timestamps and inspect missing or inconsistent samples."],
      ["Model","Estimate motion using Newton–Euler dynamics and motor-to-force mapping."],
      ["Validate","Compare prediction and measurements; document errors and limitations."]
    ],
    data:"Flight log links, CSV files, run metadata and visualization notebooks will appear here after review.",
    results:"No verified flight-test metrics are presented on this page yet.",
    lessons:"Track assumptions, timestamp issues, sensor drift, data filtering and model mismatch.",
    notes:[["Quadrotor dynamics study","note.html?slug=quadrotor-dynamics"]],
    links:[["SPACE_PLOT repository","https://github.com/biliz-nguyen/SPACE_PLOT"]]
  },
  {
    slug:"control-simulation",number:"003",type:"SIMULATION",title:"Control & Simulation",
    summary:"Compare control ideas and learning algorithms in reproducible simulated environments.",
    status:"STUDY TRACK",scope:"Simulation",
    objective:"Connect equations, controller design and reinforcement learning to measurable simulation behavior before considering deployment.",
    questions:[
      "Which state, action and disturbance definitions are physically meaningful?",
      "How do controller gains or reward terms change stability and performance?",
      "Will conclusions persist across random seeds and changed initial conditions?"
    ],
    setup:[
      "Simulation environment, dynamics model, integrator and timestep",
      "Controller or policy specification, hyperparameters and random seeds",
      "Evaluation scenarios and comparable performance metrics"
    ],
    workflow:[
      ["Specify","Document the state space, action space and physical assumptions."],
      ["Baseline","Run a simple, reproducible control baseline."],
      ["Vary","Change one factor at a time and repeat across multiple seeds."],
      ["Measure","Inspect tracking error, stability, effort and sensitivity."],
      ["Compare","Summarize improvements, regressions and sim-to-real risks."]
    ],
    data:"Configuration files, reproducible code and plots are intended to be attached with the first documented runs.",
    results:"This is a learning and experiment template; no benchmark scores are asserted.",
    lessons:"Document sensitivity to timestep, reward design, initialization and modeling assumptions.",
    notes:[["Reinforcement learning study","note.html?slug=reinforcement-learning"],["Quadrotor model fundamentals","note.html?slug=quadrotor-dynamics"]],
    links:[]
  },
  {
    slug:"hardware-prototypes",number:"004",type:"BUILD",title:"Hardware Prototypes",
    summary:"Hardware integration, CAD assemblies, wiring and practical prototype verification.",
    status:"DESIGN TRACK",scope:"Hardware / CAD",
    objective:"Create documented prototypes with repeatable dimensions, assembly steps and validation checks.",
    questions:[
      "How do real component dimensions and tolerances affect the assembly?",
      "What wiring, power and mechanical constraints must be checked?",
      "How can the design be tested without overstating a preliminary prototype?"
    ],
    setup:[
      "Component inventory with measured dimensions and datasheets",
      "CAD model, fasteners, power connections and mounting constraints",
      "For a potential camera gimbal: Raspberry Pi Camera Module 3 and two MG90S servos"
    ],
    workflow:[
      ["Measure","Capture actual component geometry, mounting points and clearances."],
      ["Design","Create parameterized CAD parts and assembly constraints."],
      ["Check","Verify collision, fit, fastener access and cable routing."],
      ["Prototype","Assemble and document real fit and functional tests."],
      ["Revise","Record tolerances, failed fits and design improvements."]
    ],
    data:"CAD exports, BOMs, assembly photos and measurements can be linked when a prototype is ready to document.",
    results:"No manufactured or tested prototype is claimed by this notebook entry.",
    lessons:"Keep a record of dimensional revisions, wiring mistakes, servo limits and lessons from assembly.",
    notes:[["Scientific foundations","note.html?slug=scientific-foundations"]],
    links:[]
  }
];