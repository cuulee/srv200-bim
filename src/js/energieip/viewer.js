function CreateView(maintenance=false){
    var labels = '';
    var scene = new xeogl.Scene({
        transparent: true
    });

    xeogl.setDefaultScene(scene);

    var camera = scene.camera;
    var input = scene.input;

    var gui = null;
    var drivers = {};
    var groups = {};

    function flyTo() {
        for (var label in drivers) {
            var d = drivers[label];
            var selected = d.id === this.id;
            if (selected) {
                var driver = drivers[label];
                if (gui != null){
                    document.getElementById('dat-gui-container').removeChild(gui.domElement);
                    gui.destroy();  
                }
                gui = new dat.GUI({autoPlace: false, top: 0, width: 400});
                document.getElementById('dat-gui-container').appendChild(gui.domElement);

                var status = gui.addFolder("Driver Status");
                status.add(driver, "deviceType").name("Driver").listen();
                status.add(driver, "statusName").name("Name").listen();

                switch (driver.deviceType){
                    case energieip.ledDriver:
                        status.add(driver, "statusLight", 0, 100).name("Light (%)").listen();
                        status.add(driver, "statusAuto").name("Auto").listen();
                        if (maintenance === true){
                            status.add(driver, "statusTimeToAuto").name("Time to Auto Mode (s)").listen();
                            status.add(driver, "statusWatchdog").name("Watchdog (s)").listen();
                        }
                        break;
                    case energieip.sensorDriver:
                        status.add(driver, "statusTemperature").name("Temperature (°C)").listen();
                        status.add(driver, "statusBrightness").name("Brightness (Lux)").listen();
                        status.add(driver, "statusPresence").name("Presence").listen();
                        status.add(driver, "statusHumidity", 0, 100).name("Humidity (%)").listen();
                        break;
                }
                status.add(driver, "statusGroup").name("Group").listen();
                if (maintenance === true){
                    status.add(driver, "statusError").name("Error Status").listen();
                    status.add(driver, "statusGroup").name("Group").listen();
                    status.add(driver, "statusBle").name("BLE").listen();
                    status.add(driver, "statusIsConfigured").name("Ready").listen();
                    status.add(driver, "statusIp").name("IP").listen();
                    status.add(driver, "statusMac").name("Mac address").listen();

                    switch (driver.deviceType){
                        case energieip.ledDriver:
                            status.add(driver, "statusThresholdLow").name("Threshold Low (%)").listen();
                            status.add(driver, "statusThresholdHigh").name("Threshold High (%)").listen();
                            status.add(driver, "statusDaisyChained").name("Daisy Chained").listen();
                            status.add(driver, "statusDaisyChainedPos").name("Daisy Chain Position").listen();
                            status.add(driver, "statusDevicePower").name("Device Power (W)").listen();
                            status.add(driver, "statusVoltageLed").name("Voltage LED (V)").listen();
                            status.add(driver, "statusEnergy").name("Cumulative Energy (Wh)").listen();
                            status.add(driver, "statusLinePower").name("Line Power (W)").listen();
                            status.add(driver, "statusDuration").name("Light Duration (h)").listen();
                            status.add(driver, "statusIMax", 0, 1000).name("IMax (mA)").listen();
                            break;
                        case energieip.sensorDriver:
                            status.add(driver, "statusBrightnessCorrectionFactor").name("Brightness Correction (x)").listen();
                            status.add(driver, "statusBrightnessRaw").name("Brightness Raw (Lux)").listen();
                            status.add(driver, "statusTemperatureOffset").name("Temperature Offset (°C)").listen();
                            status.add(driver, "statusTemperatureRaw").name("Temperature Raw (°C)").listen();
                            status.add(driver, "statusThresholdPresence").name("Threshold Presence (s)").listen();
                            status.add(driver, "statusLastMovement").name("Last Movement (s)").listen();
                            break;
                    }

                    status.add(driver, "statusVoltageInput").name("Voltage Input (V)").listen();
                    status.add(driver, "statusSoftwareVersion").name("Software Version").listen();
                    status.add(driver, "statusHardwareVersion").name("Hardware Version").listen();
                    status.add(driver, "statusSwitchMac").name("Switch Mac address").listen();
                    status.add(driver, "statusDumpFrequency").name("Refresh Frequency (s)").listen();
                }

                status.open();

                var grStatus = gui.addFolder("Group Status");
                grStatus.add(driver, "groupStatusName").name("Name").listen();
                grStatus.add(driver, "groupStatusGroup").name("Group").listen();
                grStatus.add(driver, "groupStatusLight", 0, 100).name("Light (%)").listen();
                grStatus.add(driver, "groupStatusPresence").name("Presence").listen();
                grStatus.add(driver, "groupStatusAuto").name("Auto").listen();

                if (maintenance === true){
                    grStatus.add(driver, "groupStatusError").name("Error Status").listen();
                    grStatus.add(driver, "groupStatusCorrectionInterval").name("Correction Interval (s)").listen();
                    grStatus.add(driver, "groupStatusSensorRule").name("Sensor Rule").listen();
                    grStatus.add(driver, "groupStatusSlopeStart").name("Slope Start (s)").listen();
                    grStatus.add(driver, "groupStatusSlopeStop").name("Slope Stop (s)").listen();
                    grStatus.add(driver, "groupStatusTimeToAuto").name("Time to Auto (s)").listen();
                    grStatus.add(driver, "groupStatusTimeToLeave").name("Time to Leave (s)").listen();
                    grStatus.add(driver, "groupStatusRulePresence").name("Rule Presence (s)").listen();
                    grStatus.add(driver, "groupStatusRuleBrightness").name("Rule Brightness (Lux)").listen();
                    grStatus.add(driver, "groupStatusWatchdog").name("Watchdog (s)").listen();
                }

                switch (driver.deviceType){
                    case energieip.ledDriver:
                        var controlDr = gui.addFolder("Driver Control");
                        controlDr.add(driver, "controlLight", 0, 100).name("Light (%)");
                        controlDr.add(driver, "controlAuto").name("Auto");

                        if (maintenance === true) {
                            controlDr.add({"reset": function() {
                                if (confirm("Do you want to reset the driver configuration ?")) {
                                    energieip.RestLedCfg(driver);
                                }
                            }}, "reset").name("Reset");
                        }                        
                        controlDr.add({"OK":function(){ energieip.SendLedCmd(driver); }}, "OK").name("Apply");
                        break;
                    case energieip.sensorDriver:
                        if (maintenance === true) {
                            var controlDr = gui.addFolder("Driver Control");
                            controlDr.add({"reset": function(){
                                if (confirm("Do you want to reset the driver configuration ?")) {
                                    energieip.RestSensorCfg(driver);
                                }
                            }}, "reset").name("Reset");
                        }
                        break;
                }

                var controlGr = gui.addFolder("Group Control");
                controlGr.add(driver, "groupControlLight", 0, 100).name("Light (%)");
                controlGr.add(driver, "groupControlAuto").name("Auto");
                controlGr.add({"OK":function(){ energieip.SendGroupCmd(driver); }}, "OK").name("Apply");

                var configuration = gui.addFolder("Driver Configuration");
                configuration.add(driver, "configName").name("Name");
                if (maintenance === true){
                    configuration.add(driver, "configGroup").name("Group");
                    configuration.add(driver, "configBle").name("BLE");
                    configuration.add(driver, "configDumpFrequency").name("Refresh Frequency (s)");
                    switch (driver.deviceType){
                        case energieip.ledDriver:
                            configuration.add(driver, "configThresholdLow",  0, 100).name("Threshold Low (%)");
                            configuration.add(driver, "configThresholdHigh",  0, 100).name("Threshold High (%)");
                            configuration.add(driver, "configWatchdog").name("Watchdog");
                            configuration.add({"OK":function(){ energieip.UpdateLedCfg(driver); }}, "OK").name("Apply");
                            break;
                        case energieip.sensorDriver:
                            configuration.add(driver, "configBrightnessCorrectionFactor").name("Brightness Correction (x)");
                            configuration.add(driver, "configTemperatureOffset").name("Temperature Offset (°C)");
                            configuration.add(driver, "configThresholdPresence").name("Threshold Presence (s)");
                            configuration.add({"OK":function(){ energieip.UpdateSensorCfg(driver); }}, "OK").name("Apply");
                            break;
                    }
                
                } else {
                    switch (driver.deviceType){
                        case energieip.ledDriver:
                            configuration.add({"OK":function(){ energieip.UpdateLedNameCfg(driver); }}, "OK").name("Apply");
                            break;
                        case energieip.sensorDriver:
                            configuration.add({"OK":function(){ energieip.UpdateSensorNameCfg(driver); }}, "OK").name("Apply");
                            break;
                    }
                }

                var configurationGr = gui.addFolder("Group Configuration");
                configurationGr.add(driver, "groupConfigName").name("Name");
                
                if (maintenance === true) {
                    configurationGr.add(driver, "groupConfigSlopeStart").name("Slope Start (s)");
                    configurationGr.add(driver, "groupConfigSlopeStop").name("Slope Stop (s)");
                    configurationGr.add(driver, "groupConfigCorrectionInterval").name("Correction Interval (s)");
                    configurationGr.add(driver, "groupConfigSensorRule", ["average", "min", "max"]).name("Sensor Rule");
                    configurationGr.add(driver, "groupConfigRulePresence").name("Rule Presence (s)");
                    configurationGr.add(driver, "groupConfigRuleBrightness").name("Rule Brightness (Lux)");
                    configurationGr.add({"OK": function(){ energieip.UpdateGroupCfg(driver); }}, "OK").name("Apply");

                    var ifc = gui.addFolder("Driver Information");
                    ifc.add(driver, "ifcModelName").name("Model Name");
                    ifc.add(driver, "ifcUrl").name("URL");
                    ifc.add(driver, "ifcVendor").name("Vendor Name");
                } else {
                    configurationGr.add({"OK": function(){ energieip.UpdateGroupNameCfg(driver); }}, "OK").name("Apply");
                }
            }
            d.labelShown = selected;
        }
    }


    //---------------------------------------------------
    // Load the model
    //---------------------------------------------------
    var model = new xeogl.GLTFModel({
        id: "map",
        src: "maps/N8B-3MK-V4.optimized.gltf",
        objectTree: true,
        scale: [.6, .6, .6],
        handleNode: (function() {
            return function (nodeInfo, actions) {
                console.log("=== " , nodeInfo);
                if (nodeInfo.name && nodeInfo.mesh !== undefined) {
                    var parse = nodeInfo.name.split("_");
                    parse.splice(0, 1);
                    var label = parse.join("_");
                    if (label.indexOf('_') > -1){
                        labels += label + ","
                    }
                    actions.createObject = {
                        id: label,
                    };
                }
                return true;
            };
        })()
    });
    model.ghosted = false;


    //-----------------------------------------------------------------------------------------------------
    // Camera
    //-----------------------------------------------------------------------------------------------------

    camera.eye = [-20.21798706054688, 50.6997528076172, -40.179931640625];
    camera.up = [0,1,0];

    model.on("loaded", function () {
        scene.on("tick", function () { // Slowly orbit the camera

        });
        if (labels != "") {
            labels = labels.substring(0, labels.length - 1);
        }
        energieip.GetIfcDump(labels, function (ifcDrivers){
            for (var label in model.meshes){
                if (ifcDrivers.hasOwnProperty(label)){
                    var mesh = model.meshes[label];
                    var ifcModel = ifcDrivers[label];
                    console.log("get ifcModel", ifcModel);
                    var grStatus = {};
                    var groupID = ifcModel["status"].group;
                    if (groups.hasOwnProperty(groupID)){
                        grStatus = groups[groupID];
                    } else {
                        energieip.GetGroupStatus(groupID, function (grStatus){
                            groups[groupID] = grStatus;
                        });
                        if (groups.hasOwnProperty(groupID)){
                            grStatus = groups[groupID];
                        }
                    }

                    var driver = null;
                    var content = {
                        label: label,
                        mesh: mesh,
                        occludable: false,
                        glyph: groupID.toString(),
                        title: "",
                        desc: "",
                        driverProperties: ifcModel,
                        groupProperties: grStatus,
                        pinShown: true,
                        labelShown: false
                    };
                    switch (ifcModel["ifc"].deviceType) {
                        case energieip.sensorDriver:
                            var driver = new energieip.SensorMaintenance(content);
                            break;
                        case energieip.ledDriver:
                            var driver = new energieip.LedMaintenance(content);
                            break;
                        default:
                            console.log("Received type", ifcModel["ifc"].deviceType);
                            break;
                    }
                    if (driver != null){
                        driver.on("pinClicked", flyTo);
                        drivers[label] = driver;
                    }
                }
            }
        });

        energieip.Notifications(function(evt) {
            for (var i  in evt) {
                for (var led in evt[i].leds){
                    var elt = evt[i].leds[led];
                    if (drivers.hasOwnProperty(elt.label)){
                        drivers[elt.label].updateEvent(elt.led);
                    }
                }

                for (var sensor in evt[i].sensors){
                    var elt = evt[i].sensors[sensor];
                    if (drivers.hasOwnProperty(elt.label)){
                        drivers[elt.label].updateEvent(elt.sensor);
                    }
                }

                for (var group in evt[i].groups){
                    for (var d in drivers) {
                        var gr = evt[i].groups[group];
                        if (drivers[d].statusGroup != gr.group) {
                            continue
                        }
                        drivers[d].updateGroupEvent(gr);
                    }
                }
            }

            for (var d in drivers){
                if (drivers[d].labelShown === true){
                    //refresh left menu
                    for (var i = 0; i < Object.keys(gui.__folders).length; i++) {
                        var key = Object.keys(gui.__folders)[i];
                        for (var j = 0; j < gui.__folders[key].__controllers.length; j++ ) {
                            gui.__folders[key].__controllers[j].updateDisplay();
                        }
                    }
                }
            }
        });
    });

    //----------------------------
    // Controls
    //----------------------------
    var cameraControl = new xeogl.CameraControl({
    //        panToPointer: true,
    //        pivoting: true
    });

    var cameraFlight = new xeogl.CameraFlightAnimation();

    cameraControl.on("hoverEnter", function (hit) {
        if (drivers.hasOwnProperty(hit.mesh.id)){
            drivers[hit.mesh.id].labelShown = true;
            hit.mesh.highlighted = true;
        }
    });

    cameraControl.on("hoverOut", function (hit) {
        if (drivers.hasOwnProperty(hit.mesh.id)){
            drivers[hit.mesh.id].labelShown = false;
            hit.mesh.highlighted = false;
        }
    });

    cameraControl.on("picked", function (hit) {
        var mesh = hit.mesh;
        if (input.keyDown[input.KEY_SHIFT]) {
            mesh.selected = !mesh.selected;
            mesh.highlighted = !mesh.selected;
        } else {
            cameraFlight.flyTo(mesh);
        }
    });

    cameraControl.on("pickedNothing", function (hit) {
        cameraFlight.flyTo(model);
    });
}