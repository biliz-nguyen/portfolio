# Scientific foundations: mathematics, physics and chemistry

## Why foundational science matters

Robotics brings together abstract mathematics, physical laws, measurement and the properties of real sensors and materials. This is an evolving **study note**.

## Mathematics: differential equations

The state-space description `x_dot = f(x,u,t)` expresses how a physical system evolves. Numerical methods approximate its solution over discrete sample intervals.

For `x_dot = a*x`, explicit Euler gives:

```text
x_(k+1) = x_k + dt*a*x_k
```

This has different stability behavior from the exact solution `x(t)=x(0)*exp(a*t)`, especially at large sampling intervals.

## Physics: mechanics and optics

- Newton's laws connect mass, forces and acceleration.
- Rigid-body rotation requires torque, angular momentum and inertia.
- Light propagation, reflections and measurement noise matter for LiDAR.
- Conservation laws help check whether a model is physically plausible.

## Chemistry: materials and sensing

Chemistry becomes relevant through battery electrochemistry, corrosion, sensor degradation, polymer materials and interactions of light with physical surfaces. For environmental experiments, changing material properties and surface moisture may affect measurements.

## Learning workflow

1. Define the phenomenon and all units.
2. Derive a quantitative model and state its assumptions.
3. Implement the model in a small reproducible script.
4. Compare predictions with independent measurements.
5. Record failure modes and the next hypothesis.

## What I learned

The important skill is connecting an equation to an observable quantity. A scientific portfolio should preserve that chain of reasoning rather than display formulas without context.
