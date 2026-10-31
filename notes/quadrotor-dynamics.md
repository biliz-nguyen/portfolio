# From motor speed to flight

## Research question

How can the angular velocity of four propellers predict the next state of a quadrotor? This is a **study note**, not a report of newly validated experimental results.

## State and inputs

A common 12-dimensional representation is `x = [p(3), v(3), attitude(3), omega(3)]`. Position and velocity describe translation in the world frame; angular velocity is generally expressed in the body frame. Attitude may be represented by a rotation matrix `R ∈ SO(3)` even when stored with three parameters.

Motor commands `omega_i` have units of radians per second. In an idealized rotor model, thrust and drag moment are proportional to squared motor speed:

```text
f_i = Kt * omega_i^2
q_i = Kc * omega_i^2
F = f_1 + f_2 + f_3 + f_4
```

## Translational mechanics

Newton's second law gives `m * p_ddot = R * [0,0,F]^T - m*g*e3` if positive world z points upward. Therefore:

```text
p_dot = v
v_dot = (F/m) * R*e3 - g*e3
```

Other coordinate conventions change the sign of the gravity and thrust terms; check the benchmark implementation before applying these formulas.

## Rotational mechanics

The rigid-body Euler equation is

```text
J * omega_dot + omega × (J*omega) = tau
omega_dot = J^(-1) * (tau - omega × (J*omega))
R_dot = R * hat(omega)
```

Here `hat(omega)` is a skew-symmetric matrix satisfying `hat(omega)*a = omega × a`. Individual motor moments and their signs depend on motor numbering, arm geometry and spin direction.

## One illustrative numerical example

Using the benchmark parameter values cited in the learning discussion, `Kt=3.72e-8`, `Kc=7.74e-12`, and arm length `0.0353 m`. Assume all motors spin at `1000 rad/s` for illustration:

```python
Kt, Kc = 3.72e-8, 7.74e-12
speed = 1000.0
per_rotor_thrust = Kt * speed**2
total_thrust = 4 * per_rotor_thrust
per_rotor_drag_moment = Kc * speed**2
print(per_rotor_thrust)   # 0.0372 N
print(total_thrust)       # 0.1488 N
print(per_rotor_drag_moment) # 7.74e-6 N*m
```

Equal speeds cancel ideal roll, pitch and yaw reaction torques in a symmetric quadrotor. Whether `0.1488 N` produces ascent depends on mass: hover requires `F ≈ m*g`. For an illustrative `m = 0.015 kg`, hover force is approximately `0.14715 N`, so the modeled force is slightly higher than hover. **The mass used here is illustrative, not claimed to be the benchmark's measured mass.**

## Euler time discretization

For a small time step `dt`, `p_next ≈ p + dt*v`, `v_next ≈ v + dt*v_dot`, and `omega_next ≈ omega + dt*omega_dot`. Rotation should be integrated in a way that preserves its geometry, for example `R_next = R*Exp(dt*hat(omega))` for constant body rate.

## What I learned

- Thrust is a squared-speed effect rather than a linear-speed effect.
- Torque mapping cannot be used safely without motor ordering and frame conventions.
- Good simulation results depend on measured mass, inertia, coefficients and actual timing.
- Reproducing a benchmark requires comparing its code equations and predictions against its dataset.

## References

- [Nanodrone SysID Benchmark – physics model](https://github.com/idsia-robotics/nanodrone-sysid-benchmark/blob/main/models/models.py)
