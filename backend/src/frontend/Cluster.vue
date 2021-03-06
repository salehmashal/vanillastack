<template>
    <form>
        <div class="container-fluid">
            <div class="row margin-2em">
                <div class="col">
                    <h3>Cluster-Settings</h3>
                </div>
            </div>
            <div class="row margin-2em">
                <div class="col">
                    Here you define the IP-addresses of your cluster and the associated Domain names.<br />
                    The IP-address is required for making the cluster available on your network - and it is not equal to one of the nodes IP-addresses.<br />
                    Domain names are optional. They allow separating access to the cluster workloads from access to the VanillaStack AppStore.
                    <p><em>Note: It is highly recommended to define a separate Domain name for AppStore, e.g. admin.&lt;your-cluster&gt;, otherwise access is restricted to a kubctl-Tunnel!</em></p>
                </div>
            </div>
            <div class="card margin-2em">
                <div class="card-header" id="lbHeading">
                    <h5 class="mb-0">LoadBalancer</h5>
                </div>
                <div id="lbData" class="show" aria-labelledby="lbHeading">
                    <div class="card-body">
                        <div class="form-group row">
                            <div class="col">
                                <div class="custom-control custom-switch inline-block">
                                    <input class="custom-control-input" id="useExternalLb" name="useExternalLb" type="checkbox" v-model="useExternalLb" v-on:change="triggerValidation()">
                                    <label class="custom-control-label" for="useExternalLb">
                                        Use External LoadBalancer
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <p v-if="useExternalLb">LoadBalancer-Address / IP</p>
                                <p v-if="!useExternalLb">IP-address of the cluster</p>
                                <div class="inline-block margin-right-2em">
                                    <input class="form-control input-large" placeholder="0.0.0.0" name="ip" v-model="ip" 
                                        v-on:change="triggerValidation()" v-on:blur="triggerValidation()" 
                                        required="required" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card margin-2em">
                <div class="card-header" id="lbDomain">
                    <h5 class="mb-0">Cluster Domain-Name</h5>
                </div>
                <div id="lbDomainData" class="show" aria-labelledby="lbDomain">
                    <div class="card-body">
                        <div class="form-group row">
                            <div class="col">
                                <div class="custom-control custom-switch inline-block">
                                    <input class="custom-control-input" id="clusterfqdntrigger" disabled="disabled" name="clusterfqdntrigger" type="checkbox" v-model="useclusterfqdn" v-on:click="triggerValidation()">
                                    <label class="custom-control-label" for="clusterfqdntrigger">
                                        Assign domain name to cluster
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col">
                                <div class="inline-block margin-right-2em">
                                    <input class="form-control input-large" placeholder="my.cluster" name="clusterfqdn" v-model="clusterfqdn" 
                                        v-on:change="triggerValidation()" v-on:blur="triggerValidation()" 
                                        :required="useclusterfqdn" :disabled="!useclusterfqdn" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card margin-2em">
                <div class="card-header" id="lbPrefix">
                    <h5 class="mb-0">Domain-Prefix for VanillaStore</h5>
                </div>
                <div id="lbPrefixData" class="show" aria-labelledby="lbPrefix">
                    <div class="card-body">
                        <div class="form-group row">
                            <div class="col">
                                <div class="custom-control custom-switch inline-block">
                                    <input class="custom-control-input" id="adminfqdntrigger" name="adminfqdntrigger" type="checkbox" v-model="useadminfqdn" v-on:click="triggerValidation()">
                                    <label class="custom-control-label" for="adminfqdntrigger">
                                        Use domain name for AppStore access
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group row">
                            <div class="col">
                                <div class="inline-block margin-right-2em" v-if="useadminfqdn">
                                    <input class="form-control inline-block width-5em" placeholder="admin" name="adminfqdn" v-model="adminfqdn" 
                                        v-on:change="triggerValidation()" v-on:blur="triggerValidation()" 
                                        :required="useadminfqdn" :disabled="!useadminfqdn" />
                                        .{{ clusterfqdn }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>
<script>
import Constants from './js/constants.js'
import EventBus from './js/eventBus.js'

export default {
    name: 'ip',

    data: function()  {
        return {
            ip: this.$store.state.installer.cluster.ip,
            useclusterfqdn: this.$store.state.installer.cluster.usefqdn,
            clusterfqdn: this.$store.state.installer.cluster.fqdn,
            useadminfqdn: this.$store.state.installer.cluster.useadminfqdn,
            adminfqdn: this.$store.state.installer.cluster.adminfqdn,
            useExternalLb: this.$store.state.installer.cluster.useExternalLb
        }
    },

    methods: {
        triggerValidation() {
            var isValid = false;

            // validates the data
            var validAdmin = this.useadminfqdn ? this.adminfqdn.length > 0 : true
            var validCluster = this.useclusterfqdn ? this.clusterfqdn.length > 0 : true
            var validIp = Constants.Validate_IpAddress.test(this.ip)

            isValid =  validAdmin && validCluster && validIp

            // Store the data
            this.$store.commit(Constants.Store_ClusterUpdateData, {
                ip: this.ip,
                usefqdn: this.useclusterfqdn,
                fqdn: this.clusterfqdn,
                useadminfqdn: this.useadminfqdn,
                adminfqdn: this.adminfqdn,
                useExternalLb: this.useExternalLb
            })

            // Notify about the change
            EventBus.$emit(Constants.Event_NewViewLoaded, {
                allowGoForward: isValid
            })
        }
    },

    mounted : function () {
        // Notify about being loaded
        this.triggerValidation()
    },

    created: function() {
    }
}
</script>