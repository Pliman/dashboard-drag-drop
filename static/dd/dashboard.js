var Dashboard = function(conf) {
	this._rows = [];
	this.overRow = null;
	this._draggingPanel = null;
	this.editable = false;
	var editable = conf.editable || false;
	this._container = conf.container;
	
	this._init(editable);
};

Dashboard.prototype._init = function(editable) {
	this._loadConfiguration(function(config) {
		this._createDom(config);
		this._initRows(config.dashboard.rows);

		this.disableEdit();
		editable && this.enableEdit();
	}.bind(this));
};

Dashboard.prototype._loadConfiguration = function(cb) {
	cb(CONFIGURATION);
};

Dashboard.prototype._createDom = function(config) {
	this._dom = $("<div />").addClass("nlog-dashboard").append(
			$("<div />").addClass("titlePane").append($("<h4 />").addClass("pull-left").text(config.dashboard.label))
					.append(
							$("<div />").addClass("btn-group pull-right").append(
									$("<input id=\"enableEdit\" type=\"button\" value=\"Enable edit\"/>").addClass(
											"btn").bind("click", this.enableEdit.bind(this))).append(
									$("<input id=\"disableEdit\" type=\"button\" value=\"Disable edit\"/>").addClass(
											"btn").bind("click", this.disableEdit.bind(this)))));

	this._container && $(this._container).append(this._dom);
};

Dashboard.prototype._initRows = function(rowsConf) {
	var length = rowsConf.length;

	for ( var i = 0; i < length; i++) {
		this._addRow(rowsConf[i]);
	}
};

Dashboard.prototype._addRow = function(rowConf, index) {
	var row = new Row(this, rowConf);

	if ((index === 0 || index) && index != this._rows.length) {
		var indexRow = this._rows[index];
		row.getDom().insertBefore(indexRow.getDom());

		this._rows.splice(index, 0, row);
	} else {
		this._rows.push(row);
		this._dom.append(row.getDom());
	}
};

Dashboard.prototype._delRow = function(row) {
	var index = $.inArray(row, this._rows);
	this._rows.splice(index, 1);
	row.getDom().remove();
};

Dashboard.prototype.dragPanel = function(panel, ui) {
	this.overRow = this._fromRow = panel.getRow();

	this._draggingPanel = panel;
	if (this.overRow.hasSolePanel()) {
		this._disableSiblings(this.overRow);
	}
	this._draggingPanelIndex = this._fromRow.delPanel(panel);

	this.overRow.focus(ui);
};

Dashboard.prototype.updateHolder = function(ui) {
	this.overRow && this.overRow.updateHolder(ui);
};

Dashboard.prototype.dragPanelEnd = function(panel) {
	this._draggingPanel && this.dropPanel();
};

Dashboard.prototype.dropPanel = function(index) {
	if (!this._draggingPanel) {
		return;
	}

	var panel = this._draggingPanel;
	this._draggingPanel = null;

	var toRow = this.overRow;
	toRow.blur();

	panel.setRow(toRow);
	
	index = index || toRow.holderPanelPosition;
	toRow.addPanel(panel, index);

	this._ensureBlankRow();
};

Dashboard.prototype._ensureBlankRow = function() {
	this._delBlankRow();
	this._addBlankRow();

	this.disableEdit();
	this.enableEdit();
};

Dashboard.prototype._delBlankRow = function() {
	for ( var i = this._rows.length; i >= 0; i--) {
		var row = this._rows[i];
		if (row) {
			if (row.isEmpty()) {
				this._delRow(row);
			} else {
				continue;
			}
		}
	}
};

Dashboard.prototype._addBlankRow = function() {
	var length = this._rows.length;
	if (length > 0) {
		this._addRow(null, 0);
	}
	for ( var i = 0; i < length; i++) {
		this._addRow(null, 2 * i + 2);
	}
};

Dashboard.prototype.save = function() {

};

Dashboard.prototype.enableEdit = function() {
	$("#disableEdit").removeClass("btn-primary");
	$("#enableEdit").addClass("btn-primary");

	if (this.editable) {
		return;
	}

	this._addBlankRow();

	for ( var i = 0, length = this._rows.length; i < length; i++) {
		this._rows[i].enableEdit();
	}

	this.editable = true;
};

Dashboard.prototype.disableEdit = function() {
	$("#disableEdit").addClass("btn-primary");
	$("#enableEdit").removeClass("btn-primary");

	if (!this.editable) {
		return;
	}

	this._delBlankRow();

	for ( var i = 0, length = this._rows.length; i < length; i++) {
		this._rows[i].disableEdit();
	}

	this.editable = false;
};

Dashboard.prototype.renderTo = function(container) {
	$(container).append(this._dom);
};

Dashboard.prototype.getDom = function() {
	return this._dom;
};

Dashboard.prototype.changeOverRow = function(row, ui) {
	this.overRow.blur();

	row.focus(ui);
}

Dashboard.prototype._disableSiblings = function(row) {
	var index = $.inArray(row, this._rows);

	var preRow = this._rows[index - 1];
	preRow && preRow.isEmpty() && preRow.disableEdit();

	var nextRow = this._rows[index + 1];
	nextRow && nextRow.isEmpty() && nextRow.disableEdit();
}

/**
 * initialize workFlow
 * 
 * <pre>
 * 1. create dashboard self
 * 	1.1. load configuration
 * 	1.2. create dom
 * 	1.3. init rows
 * 2. create rows self
 * 	2.1. receive row configuration from dashboard, create dom
 * 	2.2. init panels
 * 3. create panels self
 * 	3.1. receive Panel configuration from row, create dom
 * 4. disableEdit
 * </pre>
 */

/**
 * Drag and Drop workFlow
 * 
 * <pre>
 * a. drag:
 * 1. panel 'dragstart'
 * 2. dashboard 'dragPanel'
 * 
 * b. dragging
 * 1. row 'over' -- dashboard.changeOverRow
 * 
 * c. drop:
 * 1. panel 'dragstop' [row 'drop']
 * 2. if(!overRow) drop to original row
 * 3. if row 'drop' then dashboard 'dropPanel'
 * </pre>
 */
