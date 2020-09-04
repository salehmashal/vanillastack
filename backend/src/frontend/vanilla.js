import EventBus from './js/eventBus'
import Constants from './js/constants'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from './js/store'
import App from './Main.vue'
import Home from './Home.vue'
import Terms from "./Terms.vue"
import Kind from "./Kind.vue"
import Key from './Key.vue'
import Nodes from './Nodes.vue'
import 'es6-promise/auto'

// Call Vue.use(VueRouter)
Vue.use(VueRouter);

// Require all the CSS
require('bootstrap');
require('./css/bootstrap.min.css');
require('./css/vanilla-backend.css');

// Define the routes
const routes = [
    { path: '/', alias: '/start', component: Home},
    { path: '/terms', component: Terms },
    { path: '/kind', component: Kind },
    { path: '/key', component: Key},
    { path: '/nodes', component: Nodes},
    { path: '/ip', component: Key},
    { path: '/rook', component: Key},
    { path: '/cf', component: Key},
    { path: '/tools', component: Key},
    { path: '/subscription', component: Key},
    { path: '/summary', component: Key}
  ];

var currentRoute = 0;

// Set up the router
const router = new VueRouter({
    routes: routes,
    scrollBehavior() {
        return {x: 0, y: 0}
    }
  })

// Handle the forward / backward-events
EventBus.$on(Constants.Event_GoBack, e => {
  currentRoute -= 1
  app.handleNavigation(currentRoute, false)
})

// Handle the forward / backward-events
EventBus.$on(Constants.Event_GoNext, e => {
  currentRoute += 1
  app.handleNavigation(currentRoute, true)
})

// Start the app
var app = new Vue({
    router,
    store : Store,
    created: function () {
      console.log('Vue is running');
    },
    render: h => h(App),
    
    mounted: function() {
      console.log("==> Loaded Vanilla")
    },

    created: function() {
      
      EventBus.$on(Constants.Event_NewViewLoaded, data => {
        // Store the data
        this.$store.commit(Constants.Store_UpdateNavigation, data);
      }) 
    },
    
    methods: {
      getRoute: function(index, forward) {
        var route = routes[index];

        // Check, whether it is one of the dynamic routes (which might not be visible)
        if(route.path == 'rook' && !this.$store.installer.installRook)
          return this.getRoute(forward ? index + 1 : index - 1)

        if(route.path == 'cf' && !this.$store.installer.installCF)
          return this.getRoute(forward ? index + 1 : index - 1)

        if(route.path == 'openstack' && !this.$store.installer.installOpenStack)
          return this.getRoute(forward ? index + 1 : index - 1)

        return route
      },

      // Handles the navigation
      handleNavigation: function(index, forward) {
        
        // Get the route
        var route = this.getRoute(index, forward);

        // Make it visible
        if(this.$route === null || this.$route.path !== route.path) 
          router.push(route)
      
        // Set whether forward or backward navigation was possible
        this.$store.commit(Constants.Store_UpdateGlobalNavigation, {
          canGoForward: index < routes.length -1,
          canGoBack: index > 0
        })
      }
    }
  })
  .$mount("#vanilla")

app.handleNavigation(0, true)

console.log("Started Vue");
  