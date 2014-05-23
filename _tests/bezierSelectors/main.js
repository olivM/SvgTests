jQuery(function() {
	BezierSelectors.setup();
});

var BezierSelectors = {

	paper: null,
	nbSelectors: 5,
	selectors: {},
	curves: {},
	width: jQuery(window).width(),
	height: jQuery(window).height(),
	steps: 5,
	margin: 50,

	setup: function() {
		this.paper = Raphael('bezierSelector', this.width - 50, this.height - 50)
		var i;
		for (i = 1; i <= this.nbSelectors; i++) {
			this.selectors[i] = new BezierSelector({
				name: i,
				env: this,
				steps: this.steps,
				value: Math.round(Math.random() * this.steps)
			});
			this.createCurve(i - 0.5, this.selectors[i - 1], this.selectors[i]);
		}
		this.createCurve(i + 0.5, this.selectors[i], null);
		this.draw();
	},
	createCurve: function(idx, start, end) {
		this.curves[idx] = new BezierSelectorCurve({
			env: this,
			name: idx,
			start: start,
			end: end,
		});
	},

	curveWidth: function() {
		return (this.width - (this.margin * 2)) / (this.nbSelectors + 1);
	},
	curveHeight: function() {
		return this.height - (this.margin * 2);
	},

	draw: function() {
		jQuery.each(this.curves, function(idx, curve) {
			curve.draw();
		})
	}

};

var BezierSelector = function(args) {
	var _ = {
		name: null,
		steps: null,
		value: null,

		setup: function(args) {
			jQuery.each(args, function(k, v) {
				_[k] = v;
			});
			return this;
		},
		value: function() {
			return this.value;
		},
		position: function() {
			return {
				x: this.env.margin + this.env.curveWidth() * this.name,
				y: this.env.margin + (this.env.curveHeight() / this.steps) * this.value
			};
		}

	};
	return _.setup(args);
}

var BezierSelectorCurve = function(args) {

	var _ = {
		name: null,
		start: null,
		end: null,
		A: null,
		B: null,
		Ac: null,
		Bc: null,

		setup: function(args) {
			jQuery.each(args, function(k, v) {
				_[k] = v;
			});

			console.log(this.env.curveWidth());

			if (this.start) {
				this.A = this.start.position();
			} else {
				this.A = {
					x: this.env.margin + this.env.curveWidth() * (this.name - 1),
					y: this.env.margin + this.env.curveHeight()
				};
			}
			this.Ac = {
				x: this.A.x + this.env.curveWidth() / 2,
				y: this.A.y
			};

			if (this.end) {
				this.B = this.end.position();
			} else {
				this.B = {
					x: this.env.margin + this.env.curveWidth() * (this.name - 1),
					y: this.env.margin + this.env.curveHeight()
				};
			}

			this.Bc = {
				x: this.B.x - this.env.curveWidth() / 2,
				y: this.B.y
			};

			return this;
		},

		// Draw the curve and control paths if necessary
		draw: function() {
			console.log(this.A);
			this.env.paper.path(this.connectPath()).toBack();
		},

		// Return the path options for the curve between the two points
		connectPath: function() {
			var p = [],
				path = '';
			p.push("M" + this.A.x + " " + this.A.y + " ");
			p.push("C" + this.Ac.x + " " + this.Ac.y);
			p.push(" " + this.Bc.x + " " + this.Bc.y);
			p.push(" " + this.B.x + " " + this.B.y);
			path = p.join('');
			console.log(path);
			$('#pathString').html(path);
			return path;
		},

		control1Path: function() {
			var p = [];
			p.push("M" + this.A.x + " " + this.A.y + " ");
			p.push("L" + this.Ac.x + " " + this.Ac.y);
			return p.join('');
		},

		control2Path: function() {
			var p = [];
			p.push("M" + this.B.x + " " + this.B.y + " ");
			p.push("L" + this.Bc.x + " " + this.Bc.y);
			return p.join('');
		},

		movingEl: null,
		pointX: 0,
		pointY: 0,

		pointMoveStart: function(x, y, event) {
			CURVE.movingEl = $('#' + event.target.id);
			CURVE.pointX = event.offsetX;
			CURVE.pointY = event.offsetY;
		},

		pointMoveEnd: function() {},

		pointMove: function(dx, dy) {
			var elId = CURVE.movingEl.attr('id');
			$('#' + elId + 'X').val(CURVE.pointX + dx);
			$('#' + elId + 'Y').val(CURVE.pointY + dy);
			CURVE.drawCurve();
		},

		// Helper methods
		startX: function() {
			return parseInt($('#startX').val(), 10);
		},
		startY: function() {
			return parseInt($('#startY').val(), 10);
		},
		control1X: function() {
			return parseInt($('#control1X').val(), 10);
		},
		control1Y: function() {
			return parseInt($('#control1Y').val(), 10);
		},
		control2X: function() {
			return parseInt($('#control2X').val(), 10);
		},
		control2Y: function() {
			return parseInt($('#control2Y').val(), 10);
		},
		endX: function() {
			return parseInt($('#endX').val(), 10);
		},
		endY: function() {
			return parseInt($('#endY').val(), 10);
		}
	};
	return _.setup(args);
};