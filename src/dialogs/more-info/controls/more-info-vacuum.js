import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-listbox/paper-listbox.js";
import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "@polymer/polymer/polymer-element.js";

import "../../../components/ha-attributes.js";

class MoreInfoVacuum extends PolymerElement {
  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment"></style>
    <style>
      :host {
        @apply --paper-font-body1;
        line-height: 1.5;
      }

      .status-subtitle {
        color: var(--secondary-text-color);
      }

      paper-item {
        cursor: pointer;
      }

    </style>

    <div class="horizontal justified layout">
      <div hidden$="[[!supportsStatus(stateObj)]]">
        <span class="status-subtitle">Status: </span><span><strong>[[stateObj.attributes.status]]</strong></span>
      </div>
      <div hidden$="[[!supportsBattery(stateObj)]]">
        <span><iron-icon icon="[[stateObj.attributes.battery_icon]]"></iron-icon> [[stateObj.attributes.battery_level]] %</span>
      </div>
    </div>
    <div hidden$="[[!supportsCommandBar(stateObj)]]">
      <p></p>
      <div class="status-subtitle">Vacuum cleaner commands:</div>
      <div class="horizontal justified layout">
        <template is="dom-if" if="[[supportsStart(stateObj)]]">
          <div>
            <paper-icon-button icon="hass:play" on-click="onStart" title="Start"></paper-icon-button>
          </div>
          <div hidden$="[[!supportsPause(stateObj)]]">
            <paper-icon-button icon="hass:pause" on-click="onPause" title="Pause"></paper-icon-button>
          </div>
        </template>
        <template is="dom-if" if="[[!supportsStart(stateObj)]]">
          <div hidden$="[[!supportsPause(stateObj)]]">
            <paper-icon-button icon="hass:play-pause" on-click="onPlayPause" title="Pause"></paper-icon-button>
          </div>
        </template>
        
        <div hidden$="[[!supportsStop(stateObj)]]">
          <paper-icon-button icon="hass:stop" on-click="onStop" title="Stop"></paper-icon-button>
        </div>
        <div hidden$="[[!supportsCleanSpot(stateObj)]]">
        <paper-icon-button icon="hass:broom" on-click="onCleanSpot" title="Clean spot"></paper-icon-button>
        </div>
        <div hidden$="[[!supportsLocate(stateObj)]]">
        <paper-icon-button icon="hass:map-marker" on-click="onLocate" title="Locate"></paper-icon-button>
        </div>
        <div hidden$="[[!supportsReturnHome(stateObj)]]">
        <paper-icon-button icon="hass:home-map-marker" on-click="onReturnHome" title="Return home"></paper-icon-button>
        </div>
      </div>
    </div>

    <div hidden$="[[!supportsFanSpeed(stateObj)]]">
      <div class="horizontal justified layout">
        <paper-dropdown-menu label-float="" dynamic-align="" label="Fan speed">
          <paper-listbox slot="dropdown-content" selected="{{fanSpeedIndex}}">
            <template is="dom-repeat" items="[[stateObj.attributes.fan_speed_list]]">
              <paper-item>[[item]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
        <div style="justify-content: center; align-self: center; padding-top: 1.3em">
          <span><iron-icon icon="hass:fan"></iron-icon> [[stateObj.attributes.fan_speed]]</span>
        </div>
      </div>
      <p></p>
    </div>
    <ha-attributes state-obj="[[stateObj]]" extra-filters="fan_speed,fan_speed_list,status,battery_level,battery_icon"></ha-attributes>
`;
  }

  static get properties() {
    return {
      hass: {
        type: Object,
      },

      inDialog: {
        type: Boolean,
        value: false,
      },

      stateObj: {
        type: Object,
      },

      fanSpeedIndex: {
        type: Number,
        value: -1,
        observer: "fanSpeedChanged",
      },
    };
  }

  /* eslint-disable no-bitwise */

  supportsPause(stateObj) {
    return (stateObj.attributes.supported_features & 4) !== 0;
  }

  supportsStop(stateObj) {
    return (stateObj.attributes.supported_features & 8) !== 0;
  }

  supportsReturnHome(stateObj) {
    return (stateObj.attributes.supported_features & 16) !== 0;
  }

  supportsFanSpeed(stateObj) {
    return (stateObj.attributes.supported_features & 32) !== 0;
  }

  supportsBattery(stateObj) {
    return (stateObj.attributes.supported_features & 64) !== 0;
  }

  supportsStatus(stateObj) {
    return (stateObj.attributes.supported_features & 128) !== 0;
  }

  supportsLocate(stateObj) {
    return (stateObj.attributes.supported_features & 512) !== 0;
  }

  supportsCleanSpot(stateObj) {
    return (stateObj.attributes.supported_features & 1024) !== 0;
  }

  supportsStart(stateObj) {
    return (stateObj.attributes.supported_features & 8192) !== 0;
  }

  supportsCommandBar(stateObj) {
    return (
      ((stateObj.attributes.supported_features & 4) !== 0) |
      ((stateObj.attributes.supported_features & 8) !== 0) |
      ((stateObj.attributes.supported_features & 16) !== 0) |
      ((stateObj.attributes.supported_features & 512) !== 0) |
      ((stateObj.attributes.supported_features & 1024) !== 0) |
      ((stateObj.attributes.supported_features & 8192) !== 0)
    );
  }

  /* eslint-enable no-bitwise */

  fanSpeedChanged(fanSpeedIndex) {
    var fanSpeedInput;
    // Selected Option will transition to '' before transitioning to new value
    if (fanSpeedIndex === "" || fanSpeedIndex === -1) return;

    fanSpeedInput = this.stateObj.attributes.fan_speed_list[fanSpeedIndex];
    if (fanSpeedInput === this.stateObj.attributes.fan_speed) return;

    this.hass.callService("vacuum", "set_fan_speed", {
      entity_id: this.stateObj.entity_id,
      fan_speed: fanSpeedInput,
    });
  }

  onStop() {
    this.hass.callService("vacuum", "stop", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onPlayPause() {
    this.hass.callService("vacuum", "start_pause", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onPause() {
    this.hass.callService("vacuum", "pause", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onStart() {
    this.hass.callService("vacuum", "start", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onLocate() {
    this.hass.callService("vacuum", "locate", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onCleanSpot() {
    this.hass.callService("vacuum", "clean_spot", {
      entity_id: this.stateObj.entity_id,
    });
  }

  onReturnHome() {
    this.hass.callService("vacuum", "return_to_base", {
      entity_id: this.stateObj.entity_id,
    });
  }
}

customElements.define("more-info-vacuum", MoreInfoVacuum);
