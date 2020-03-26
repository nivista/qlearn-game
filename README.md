# Welcome to QLearn

QLearn is a game that that can be controlled by an AI trained with Q-learning

### What is Q-learning?

Q-learning is a reinforcement learning algorithm where an agent gets progressively better approximations of the expected reward from taking particular actions through trial and error. It operates in a [Markov Decision Process](https://en.wikipedia.org/wiki/Markov_decision_process) where not all the reward and transition functions are known.

### What can Reinforcement Learning be used for?

Check out this Medium [article](https://towardsdatascience.com/applications-of-reinforcement-learning-in-real-world-1a94955bcd12).

### What technologies were used in this project?

This is a React.JS project bootstrapped with create-react-app. It used web workers to train the bot asynchronously. It also used refs to manage focus, and [Recharts](http://recharts.org/) for the graph.

### Tips for enjoying the game

Think about how in certain maps the agent will have to make trade offs between risk and reward, and try to make the decision tough! Going past a red end state is risky because depending on the Fail Rate the agent might accidently go into it. On the other hand, if the agent can reach a green end state quickly then he accumulates minimal cost of living, increasing the total reward at the end. See how it makes progress training normally, and see how much of a boost Train Asynchronously can give. Have fun!
