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
		this.paper = Raphael('bezierSelector', this.width, this.height)
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
		this.createCurve(i - 0.5, this.selectors[i - 1], this.selectors[i]);
		// this.createCurve(i + 0.5, this.selectors[i], null);
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
		tmp_value: null,
		tmp_pos: null,
		handlerRadius: 30,
		handler: null,

		setup: function(args) {
			jQuery.each(args, function(k, v) {
				_[k] = v;
			});
			console.log("value : " + this.value);
			this.tmp_pos = this.env.margin + this.value * this.env.curveHeight() / this.env.steps;
			this.drawPoint();
			return this;
		},
		value: function() {
			return this.value;
		},
		setValue: function() {
			this.value = Math.max(0, Math.min(this.steps, Math.round((this.handler.attr('cy') - this.env.margin) / this.env.curveHeight() * this.steps)));
			console.log(this.value);
			this.handler.attr({
				cy: this.env.margin + this.value * this.env.curveHeight() / this.env.steps
			});
			this.updateCurves(250);
		},
		setTmpValue: function() {
			this.tmp_value = Math.max(0, Math.min(this.steps, Math.round((this.handler.attr('cy') - this.env.margin) / this.env.curveHeight() * this.steps)));
		},
		position: function() {
			if (this.handler) {
				return {
					x: this.handler.attr('cx'),
					y: this.handler.attr('cy')
				};
			} else {
				return {
					x: this.env.margin + this.env.curveWidth() * this.name,
					y: this.env.margin + (this.env.curveHeight() / this.steps) * this.value
				};
			}
		},
		// Creates a basic point
		drawPoint: function(name) {
			this.handler = this.env.paper.circle(this.position().x, this.position().y, this.handlerRadius)
			jQuery(this.handler.node).attr('id', name);
			this.handler.selector = this;

			this.handler.attr({
				stroke: null,
				fill: '#DDD',
				opacity: 0
			})
			this.handler.hover(function() {
				this.animate({
					opacity: 0.5
				}, 500, '>');
			}, function() {
				this.animate({
					opacity: 0
				}, 500, '<');
			});

			this.handler.drag(this.pointMove, this.pointMoveStart, this.pointMoveEnd);
		},

		pointMove: function(dx, dy) {
			this.selector.handler.attr({
				cy: this.selector.tmp_pos + dy
			});
			this.selector.updateCurves();
		},

		pointMoveStart: function(dx, dy) {
			this.selector.tmp_pos = dy;
			this.selector.handler.animate({
				opacity: 0.5
			});
		},

		pointMoveEnd: function() {
			this.selector.setValue();
			this.selector.handler.animate({
				opacity: 0
			});
		},

		updateCurves: function(delay) {
			console.log("updateCurves");
			this.env.curves[this.name - 0.5].update(delay);
			this.env.curves[this.name + 0.5].update(delay);
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
		path: null,

		setup: function(args) {
			jQuery.each(args, function(k, v) {
				_[k] = v;
			});
			if (this.start) {
				this.A = this.start.position();
			} else {
				this.A = {
					x: this.env.margin,
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
					x: this.env.width - this.env.margin,
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
			this.path = this.env.paper.path(this.connectPath()).toBack();
		},
		update: function(delay) {

			if (this.start) {
				this.A.y = this.start.position().y;
			}
			this.Ac.y = this.A.y;

			if (this.end) {
				this.B.y = this.end.position().y;
			}
			this.Bc.y = this.B.y;

			this.path.animate({
				path: this.connectPath()
			}, delay ? delay : 1);

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

			return path;
		},

	};
	return _.setup(args);
};