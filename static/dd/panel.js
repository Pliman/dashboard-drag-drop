/**
 * Panel object example:
 * 
 * <pre>
 * {
 * 	title : '',
 * 	searchName : '',
 * 	maxLines : 10
 * }
 * </pre>
 * 
 * @returns
 */
var Panel = function(dashboard, row, config) {
	this._dashboard = dashboard;
	this._row = row;
	this._maskPane = null;

	config = config || {};
	this._title = config.title || "Default Panel";
	this._searchName = config._searchName || "";
	this._maxLines = config._maxLines || 10;

	this._init();
};

Panel.prototype._init = function(title) {
	this._createDom();
};

Panel.prototype._createDom = function(title) {
	var _dom = this._dom = $("<div />").append(
			$("<div />").addClass("panel").append($("<span />").addClass("title").text(this._title))).addClass(
			"panel-container");

	this.resetPosition();
	_dom.draggable({
		disabled : true,
		opacity : 0.7,
		cursor : "move",
		helper : function() {
			var dom = this._dom.clone().css({
				zIndex : 10
			});

			$(".nlog-dashboard").append(dom);

			return dom;
		}.bind(this)
	});
};

Panel.prototype.refresh = function() {

};

Panel.prototype.destroy = function() {
	this._row.delPanel(this);
	this._dom.remove();
};

Panel.prototype.getDom = function() {
	return this._dom;
};

Panel.prototype.getRow = function() {
	return this._row;
};

Panel.prototype.enableEdit = function() {
	this._dom.draggable("enable");

	this._dom.bind("dragstart", function(event, ui) {
		this._dashboard.dragPanel(this, ui);
	}.bind(this));

	this._dom.bind("drag", function(event, ui) {
		this._dashboard.updateHolder(ui);
	}.bind(this));

	this._dom.bind("dragstop", function() {
		this._dashboard.dragPanelEnd(this);
	}.bind(this));
	
	this._dom.addClass("panel-editing");
	this._addMaskpane();
};

Panel.prototype.disableEdit = function() {
	this._dom.draggable("disable");

	this._dom.unbind("dragstart");
	this._dom.unbind("drag");
	this._dom.unbind("dragstop");
	
	this._dom.removeClass("panel-editing");
	this._removeMaskpane();
};

Panel.prototype._addMaskpane = function() {
	var maskPane = this._maskPane = $("<div />").addClass("mask-pane");
	maskPane.css({
		width: $(".panel",this._dom).width()+1,
		height: $(".panel",this._dom).height()+1
	});
	this._dom.append(maskPane);
	
	this._dom.bind("mouseenter",function(){
		this._maskPane.addClass("over-pane");
	}.bind(this));
	
	this._dom.bind("mouseleave",function(){
		this._maskPane.removeClass("over-pane");
	}.bind(this));
};

Panel.prototype._removeMaskpane = function() {
	if(!this._maskPane){
		return;
	}
	
	this._maskPane.remove();
	this._maskPane = null;
};

Panel.prototype.setWidth = function(width) {
	this._dom.css("width", width);
};

Panel.prototype.resetPosition = function() {
	this._dom.css({
		top : "0px",
		left : "0px"
	});
};

Panel.prototype.setRow = function(row) {
	this._row = row;
};