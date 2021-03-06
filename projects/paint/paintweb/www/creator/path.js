// 创建路径的 Controller
class QPathCreator {

    constructor(close) {
        this.points = [];
        this.fromPos = this.toPos = {x: 0, y: 0}
        this.close = close;
        this.started = false;
        let ctrl = this;

        // fallback view, 重新设置 view 的事件处理程序，委托给 Controller 去完成对应的处理
        qview.onmousedown = function (event) {
            ctrl.onmousedown(event)
        };
        qview.onmousemove = function (event) {
            ctrl.onmousemove(event)
        };
        qview.ondblclick = function (event) {
            ctrl.ondblclick(event)
        };
        qview.onkeydown = function (event) {
            ctrl.onkeydown(event)
        };
    }

    stop() {
        qview.onmousedown = null
        qview.onmousemove = null
        qview.ondblclick = null
        qview.onkeydown = null
    }

    reset() {
        this.points = []
        this.started = false
        invalidate(null)
    }

    buildShape() {
        let points = [{x: this.fromPos.x, y: this.fromPos.y}]
        for (let i in this.points) {
            points.push(this.points[i])
        }
        return new Path(points, this.close, qview.lineStyle)
    }

    onmousedown(event) {
        this.toPos = qview.getMousePos(event);
        if (this.started) {
            this.points.push(this.toPos);
        } else {
            this.fromPos = this.toPos;
            this.started = true
        }
        invalidate(null)
    }

    onmousemove(event) {
        if (this.started) {
            this.toPos = qview.getMousePos(event);
            invalidate(null)
        }
    }

    ondblclick(event) {
        if (this.started) {
            qview.doc.addShape(this.buildShape());
            this.reset()
        }
    }

    onkeydown(event) {
        switch (event.keyCode) {
            case 13: // keyEnter
                let n = this.points.length
                if (n == 0 || this.points[n - 1] !== this.toPos) {
                    this.points.push(this.toPos)
                }
                this.ondblclick(event)
                break
            case 27: // keyEsc
                this.reset()
        }
    }

    onpaint(ctx) {
        if (this.started) {
            let props = qview.properties
            ctx.lineWidth = props.lineWidth
            ctx.strokeStyle = props.lineColor
            ctx.beginPath()
            ctx.moveTo(this.fromPos.x, this.fromPos.y)
            for (let i in this.points) {
                ctx.lineTo(this.points[i].x, this.points[i].y)
            }
            ctx.lineTo(this.toPos.x, this.toPos.y)
            if (this.close) {
                ctx.closePath()
            }
            ctx.stroke()
        }
    }
}

qview.registerController("PathCreator", function () {
    return new QPathCreator();
});