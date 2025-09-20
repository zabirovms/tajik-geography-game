import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import FlagsGame from '../views/games/FlagsGame.vue'
import ShapesGame from '../views/games/ShapesGame.vue'
import CapitalsGame from '../views/games/CapitalsGame.vue'
import TimedChallenge from '../views/games/TimedChallenge.vue'
import Multiplayer from '../views/games/Multiplayer.vue'
import RandomMode from '../views/games/RandomMode.vue'
import Achievements from '../views/Achievements.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/games/flags',
    name: 'FlagsGame',
    component: FlagsGame
  },
  {
    path: '/games/shapes',
    name: 'ShapesGame',
    component: ShapesGame
  },
  {
    path: '/games/capitals',
    name: 'CapitalsGame',
    component: CapitalsGame
  },
  {
    path: '/games/timed-challenge',
    name: 'TimedChallenge',
    component: TimedChallenge
  },
  {
    path: '/games/multiplayer',
    name: 'Multiplayer',
    component: Multiplayer
  },
  {
    path: '/games/random',
    name: 'RandomMode',
    component: RandomMode
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: Achievements
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router