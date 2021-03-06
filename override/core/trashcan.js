import '../../blockly_built/blockly_compressed.js';

/* global Blockly, goog */

Blockly.Trashcan.prototype.IMAGE_WIDTH = 18.15;
Blockly.Trashcan.prototype.IMAGE_HEIGHT = 24.43;
Blockly.Trashcan.prototype.WIDTH_ = 28;
Blockly.Trashcan.prototype.LID_HEIGHT_ = 8;
Blockly.Trashcan.prototype.BODY_HEIGHT_ = 16;

Blockly.Trashcan.BIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.15 24.43"><title>Bin-1</title>
<g id="Layer_2" data-name="Layer 2">
<g id="Layer_5" data-name="Layer 5">
<path id="body" d="M2.15,8.23H16a1.1,1.1,0,0,1,.81.36,1.08,1.08,0,0,1,.28.83L15.9,23.48a1,1,0,0,1-.33.68,1,1,0,0,1-.69.28H3.27a1,1,0,0,1-.71-.28,1,1,0,0,1-.33-.68L1.06,9.42a1.14,1.14,0,0,1,.3-.83A1.08,1.08,0,0,1,2.15,8.23Z"/>
<path id="lid" d="M17.09,6.3H1a1,1,0,0,1-.83-.42A1,1,0,0,1,.05,5L.54,3.12a1,1,0,0,1,.8-.69A35.71,35.71,0,0,1,5.52,2a.74.74,0,0,0,.62-.59A3.72,3.72,0,0,1,6.72.36Q7,0,9.07,0t2.32.35a3.34,3.34,0,0,1,.47.8l.23.52a.7.7,0,0,0,.66.38q.52,0,2.15.17t1.9.21a1,1,0,0,1,.8.69L18.1,5a1,1,0,0,1-.15.92A1,1,0,0,1,17.09,6.3Z"/>
</g>
</g></svg>
`;

Blockly.Trashcan.prototype.createDom = function () {
    /* Force flyout width limit. */
    if (this.flyout_) {
        this.flyout_.width_limit_ = 500;
    }

    /* Here's the markup that will be generated:
    <g class="blocklyTrash">
    <clippath id="blocklyTrashBodyClipPath837493">
        <rect width="47" height="45" y="15"></rect>
    </clippath>
    <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#blocklyTrashBodyClipPath837493)"></image>
    <clippath id="blocklyTrashLidClipPath837493">
        <rect width="47" height="15"></rect>
    </clippath>
    <image width="84" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#blocklyTrashLidClipPath837493)"></image>
    </g>
    */
    let svgDom = (new DOMParser()).parseFromString(Blockly.Trashcan.BIN_SVG, 'text/xml'),
        root = svgDom.documentElement,
        lid = root.querySelector('#lid'),
        body = root.querySelector('#body');

    this.svgGroup_ = Blockly.utils.createSvgElement('g', { class: 'blocklyTrash' }, null);
    this.rotationGroup = Blockly.utils.createSvgElement('g', {
        'transform-origin': 'center center'
    }, this.svgGroup_);
    this.binGroup = Blockly.utils.createSvgElement('g', {
        transform: `scale(${this.WIDTH_ / this.IMAGE_WIDTH}, ${this.WIDTH_ / this.IMAGE_WIDTH})`
    }, this.rotationGroup);

    lid.setAttribute('transform-origin', 'right bottom');

    this.binGroup.appendChild(lid);
    this.binGroup.appendChild(body);

    this.svgLid_ = lid;

    Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup', this, this.click);
    Blockly.bindEvent_(body, 'mouseover', this, this.mouseOver_);
    Blockly.bindEvent_(body, 'mouseout', this, this.mouseOut_);
    this.animateLid_();
    return this.svgGroup_;
};

/**
 * Move the trash can to the bottom-right corner.
 */
Blockly.Trashcan.prototype.position = function() {
  // Not yet initialized.
  if (!this.verticalSpacing_) {
    return;
  }

  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_LEFT
    || (this.workspace_.horizontalLayout && !this.workspace_.RTL)) {
    // Toolbox starts in the left corner.
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
      this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;
  } else {
    // Toolbox starts in the right corner.
    this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
  }

  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    this.top_ = this.verticalSpacing_;
  } else {
    this.top_ = metrics.viewHeight + metrics.absoluteTop -
        (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.verticalSpacing_;
  }
  this.top_ -= 15;

  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};


/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
Blockly.Trashcan.prototype.close = function () {
    this.setOpen_(false);
};

/**
 * Return the deletion rectangle for this trash can.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.Trashcan.prototype.getClientRect = function() {
    if (!this.svgGroup_) {
        return null;
    }

    var trashRect = this.svgGroup_.getBoundingClientRect();
    var left = trashRect.left - this.MARGIN_HOTSPOT_;
    var top = trashRect.top - this.MARGIN_HOTSPOT_;
    var width = this.WIDTH_ + 2 * this.MARGIN_HOTSPOT_;
    var height = this.LID_HEIGHT_ + this.BODY_HEIGHT_ + 2 * this.MARGIN_HOTSPOT_;
    return new goog.math.Rect(left, top, width, height);

};


/**
 * Inspect the contents of the trash.
 */
Blockly.Trashcan.prototype.click = function() {
    if (!this.hasBlocks_) {
      return;
    }

    var xml = [];
    for (var i = 0, text; text = this.contents_[i]; i++) {
        xml[i] = Blockly.Xml.textToDom(text).firstChild;
    }
    this.flyout_.show(xml);
    Blockly.utils.addClass(this.flyout_.svgGroup_, 'trashcan-flyout');
};