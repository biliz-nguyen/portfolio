/**
 * Experiment notebook metadata. These are editable workflows/learning tracks.
 * Do not treat unfilled placeholders as evidence of completed experiments.
 */
window.EXPERIMENT_LOGS = [
  {
    slug:"unitree-lidar",number:"001",type:"SENSING",title:"Unitree LiDAR",
    summary:"A working notebook for sensor integration, point-cloud acquisition, and 3D perception.",
    status:"DOCUMENTING",scope:"Physical sensor",
    objective:"Develop a repeatable process for setting up Unitree LiDAR, inspecting point clouds, documenting coordinate frames, and evaluating measurement quality.",
    questions:[
      "What is the sensor's reference frame, and how should it be transformed into the robot or world frame?",
      "How do sampling conditions affect point density, coverage and noise?",
      "Which preprocessing steps are needed before segmentation or measurement?"
    ],
    setup:[
      "Unitree LiDAR — record the exact model, firmware, driver and mounting position",
      "Host device, power and communication configuration",
      "Recording environment, reference objects and sensor-to-target distance"
    ],
    workflow:[
      ["Connect & verify","Document power, drivers, device discovery and timestamp behavior."],
      ["Capture","Record representative sequences with repeatable motions or static scenes."],
      ["Inspect & preprocess","Visualize point clouds; inspect scale, axes, outliers and coordinate transforms."],
      ["Evaluate","Compare measurements with references and note failure modes."],
      ["Document","Attach source files, parameter values, visualizations and limitations."]
    ],
    data:"Point-cloud samples, configuration files, coordinate-frame definitions and measurement references will be linked here once selected for publication.",
    results:"No verified numerical evaluation has been published in this experiment log yet.",
    lessons:"Record calibration surprises, data-quality issues, driver problems and useful visualization techniques as work progresses.",
    notes:[["LiDAR and rubber-tree perception","note.html?slug=lidar-rubber-trees"]],
    links:[]
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