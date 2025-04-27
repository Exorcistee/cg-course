export class TWEEN {
    static Tweens = [];
    
    static update() {
        const now = performance.now();
        this.Tweens = this.Tweens.filter(tween => {
            if (tween._startTime === null) {
                tween._startTime = now;
            }
            
            const elapsed = now - tween._startTime;
            const duration = tween._duration;
            
            if (elapsed >= duration) {
                tween._onUpdate(tween._to);
                tween._onComplete();
                return false;
            }
            
            const progress = elapsed / duration;
            const current = {};
            
            for (const prop in tween._from) {
                current[prop] = tween._from[prop] + (tween._to[prop] - tween._from[prop]) * progress;
            }
            
            tween._onUpdate(current);
            return true;
        });
    }
    
    constructor(from) {
        this._from = from;
        this._to = {};
        this._duration = 0;
        this._startTime = null;
        this._onUpdate = () => {};
        this._onComplete = () => {};
    }
    
    to(to, duration) {
        this._to = to;
        this._duration = duration;
        return this;
    }
    
    onUpdate(callback) {
        this._onUpdate = callback;
        return this;
    }
    
    onComplete(callback) {
        this._onComplete = callback;
        return this;
    }
    
    start() {
        TWEEN.Tweens.push(this);
        return this;
    }
}