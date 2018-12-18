{
    energieip.Driver = class sensor extends xeogl.Annotation {
        get type() {
            return "energieip.Driver";
        }
 
        init(sensorObj) {
            super.init(sensorObj);

            this.error_color = "xeogl-annotation-pin-error";
            
            this._deviceType = "Driver";
            this._typeElement = document.createElement('div');
            this._typeElement.innerHTML = this._deviceType;
            this._typeElement.className = "xeogl-annotation-group";
            this._label.appendChild(this._typeElement);

            this._groupElement = document.createElement('div');
            this._groupElement.className = "xeogl-annotation-group";
            this._label.appendChild(this._groupElement);

            this._ipElement = document.createElement('div');
            this._ipElement.className = "xeogl-annotation-group";

            this._macElement = document.createElement('div');
            this._macElement.className = "xeogl-annotation-mac";

            this._friendlyNameElement = document.createElement('div');
            this._friendlyNameElement.className = "xeogl-annotation-alias";
            this._label.appendChild(this._friendlyNameElement);

            this.group = sensorObj.group;
            this.mac = sensorObj.mac;
            this.friendlyName = sensorObj.friendlyName;
            this.label = sensorObj.label;
            this.ip = sensorObj.ip;
        }

        get deviceType() {
            return this._deviceType;
        }

        set group(gr) {
            if (this._group === gr) {
                return;
            }
            this._group = gr || "0";
            this._groupElement.innerHTML = "Group: " +  this._group;
            this.fire("group", this);
        }

        get group() {
            return this._group;
        }

        set ip(val) {
            if (this._ip === val) {
                return;
            }
            this._ip = val || "0";
            this._ipElement.innerHTML = "IP: " +  this._ip;
            this.fire("ip", this);
        }

        get ip() {
            return this._ip;
        }

        set mac(mc) {
            if (this._mac === mc) {
                return;
            }
            this._mac = mc || "";
            this._macElement.innerHTML = "Mac: " + this._mac;
            this.fire("mac", this);
        }

        get mac() {
            return this._mac;
        }

        set friendlyName(fr) {
            if (this._friendlyName === fr) {
                return;
            }
            this._friendlyName = fr || "";
            this._friendlyNameElement.innerHTML = "Name: " + this._friendlyName;
            this.fire("friendlyName", this);
        }

        get friendlyName() {
            return this._friendlyName;
        }
    
        getJSON() {
            var json = super.getJSON();
            json.mac = this.mac;
            json.group = this._group;
            json.friendlyName = this._friendlyName;
            return json;
        }

        destroy() {
            super.destroy();
        }
    };
}