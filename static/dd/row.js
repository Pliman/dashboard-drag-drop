Row = function(dashboard, rowConf) {
	this._panels = [];
	this._dashboard = dashboard;

	this.holderPanel = null;
	this.holderPanelPosition = null;
	this._MAXPANELS = 3;

	this._createDom();

	rowConf && rowConf.panels && this._initPanels(rowConf.panels);
};

Row.prototype._createDom = function() {
	this._dom = $("<div />").addClass("droprow").droppable({
		disabled : true
	});
	this._isDroppable = false;
};

Row.prototype._initPanels = function(panelsConf) {
	for ( var i = 0, length = panelsConf.length; i < length; i++) {
		var panel = new Panel(this._dashboard, this, panelsConf[i]);
		this.addPanel(panel);
	}
};

Row.prototype.addPanel = function(panel, index, holder) {
	if ((index === 0 || index) && index != this._panels.length) {
		var indexPanel = this._panels[index];
		panel.getDom().insertBefore(indexPanel.getDom());

		this._panels.splice(index, 0, panel);
	} else {
		this._dom.append(panel.getDom());
		this._panels.push(panel);
	}

	this._resetPanelsView(holder);
};

Row.prototype.delPanel = function(panel) {
	var index = $.inArray(panel, this._panels);
	this._panels.splice(index, 1);
	panel.getDom().detach();

	this._resetPanelsView();

	return index;
};

Row.prototype.getDom = function() {
	return this._dom;
};

Row.prototype.enableEdit = function() {
	this._enableDroppable();

	for ( var i = 0, length = this._panels.length; i < length; i++) {
		this._panels[i].enableEdit();
	}
};

Row.prototype.disableEdit = function() {
	this._disableDroppable();

	for ( var i = 0, length = this._panels.length; i < length; i++) {
		this._panels[i].disableEdit();
	}
};

Row.prototype._enableDroppable = function() {
	if (this._isDroppable) {
		return;
	}

	this._dom.droppable("enable");
	this._addBehaviors();

	this._isDroppable = true;
};

Row.prototype._disableDroppable = function() {
	this._dom.droppable("disable");
	this._removeBehaviors();

	this._isDroppable = false;
};

// dropover dropout drop
Row.prototype._addBehaviors = function() {
	this._dom.bind("dropover", function(event, ui) {
		if (this._panels.length >= this._MAXPANELS) {
			return;
		}

		this._dashboard.changeOverRow(this, ui);
	}.bind(this));
	this._dom.bind("drop", function(event, ui) {
		if (!this.holderPanel && this._panels.length >= this._MAXPANELS) {
			return;
		}

		this._dashboard.dropPanel(this._getPanelIndex(ui.position.left));
	}.bind(this));
};

// dropover dropout drop
Row.prototype._removeBehaviors = function() {
	this._dom.unbind("dropover");
	this._dom.unbind("drop");
};

Row.prototype._resetPanelsView = function(holder) {
	var length = this._panels.length;
	var width = (100 / length - (holder ? 2 : 0)) + "%";
	for ( var i = 0; i < length; i++) {
		var panel = this._panels[i];
		panel.setWidth(width);
		panel.resetPosition();
	}

	this._disableDroppable;
	this._enDroppable;
};

Row.prototype._addHolderPanel = function(ui) {
	if (this.holderPanel) {
		return;
	}

	this.holderPanelPosition = this._getPanelIndex(ui.position.left);
	this.holderPanel = new HolderPanel(ui.helper.height);

	this.addPanel(this.holderPanel, this.holderPanelPosition, true);
};

Row.prototype._getPanelIndex = function(left) {
	var width = this._dom.width();
	var pLength = this._panels.length;
	var places = pLength + 1 - (this.holderPanel ? 1 : 0);
	var placesWidth = width / places;

	left = left < 0 ? 0 : left;
	return Math.floor(left / placesWidth);
};

Row.prototype._removeHolderPanel = function() {
	if (!this.holderPanel) {
		return;
	}

	this.delPanel(this.holderPanel);

	this.holderPanel = null;
	this.holderPanelPosition = null;
};

Row.prototype.updateHolder = function(ui) {
	var position = this._getPanelIndex(ui.position.left);

	if (position != this.holderPanelPosition) {
		this._removeHolderPanel();

		this._addHolderPanel(ui);
	}
};

Row.prototype.focus = function(ui) {
	this._dashboard.overRow = this;
	this._addHolderPanel(ui);
};

Row.prototype.blur = function() {
	this._removeHolderPanel();
};

Row.prototype.isEmpty = function() {
	return this._panels.length == 0;
};

Row.prototype.hasSolePanel = function() {
	return this._panels.length == 1;
};