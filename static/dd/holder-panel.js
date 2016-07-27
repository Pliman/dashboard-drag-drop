HolderPanel = function(height) {
	this._createDom(height);
};

HolderPanel.prototype._createDom = function(height) {
	var dom = this._dom = $("<div />").addClass("holder-panel");

	dom.css({
		height : height
	});
};

HolderPanel.prototype.setWidth = function(width) {
	this._dom.css("width", width);
};

HolderPanel.prototype.resetPosition = function() {
	this._dom.css({
		top : "0px",
		left : "0px"
	});
};

HolderPanel.prototype.getDom = function() {
	return this._dom;
};