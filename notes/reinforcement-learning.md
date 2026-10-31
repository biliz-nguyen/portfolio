# Reinforcement learning for autonomous robotics

## Research question

How can a robot learn behavior from interactions while remaining stable, sample-efficient and safe? This is a **learning path**, not a validated robotic controller.

## Markov decision process

A Markov decision process (MDP) is commonly modeled with `(S, A, P, R, gamma)`: states, actions, transition dynamics, reward and discount factor.

The goal is to maximize expected discounted return:

```text
J(pi) = E_pi[sum_{t=0}^infinity gamma^t * r_t]
```

The Bellman optimality equation is

```text
Q*(s,a) = E[r + gamma * max_a' Q*(s',a') | s,a]
```

## Connection to drone control

A quadrotor policy might observe position errors, velocity, attitude and body rates, and output a control target. However, raw motor-speed commands have stricter safety and actuator limits than a high-level velocity target.

A sensible learning sequence is:

1. Derive or implement a deterministic dynamics model.
2. Stabilize it with an established baseline controller.
3. Build a simulator with consistent state, action and reward units.
4. Learn a policy and assess generalization.
5. Test disturbances, sensor noise and delayed control.
6. Consider real hardware only with safety supervision and fail-safes.

## Example reward design

```python
def reward(position_error, control_effort, collision):
    return -(2.0 * position_error**2
             + 0.02 * control_effort**2
             + 100.0 * float(collision))
```

This is a **toy example**. Squared norms and reward scales must be selected to match actual state/action dimensions and a concrete task.

## What I learned

A successful learning curve is not enough evidence of a robust controller. Evaluations should include held-out initial states, disturbances, comparisons with baselines and explicit failure rates.

## Further reading

- [Sutton and Barto: Reinforcement Learning, An Introduction](http://incompleteideas.net/book/the-book-2nd.html)
