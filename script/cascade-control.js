/*
    name:           cascade-control.js
    author:         cmCaiBird
    version:        1.0
    authorize:      all
*/
function CascadeControl(dom,input){
    this._control = $(dom),
    this._input = $(input),
    this._container = this._control.children().eq(0),
    this._panel = this._container.find('.cascade-panel'),
    this._lineHeight = parseInt(this._panel.css('line-height')),
    this._enter = this._container.find('.cascade-enter'),
    this._event = [],
    this._init();
}
CascadeControlOption = {
    _init: function(){
        var cascade = this;
        
         //计算cascade-panel宽度
        this._panel.css('width', 100 / this._panel.length + '%');
        
        //为每个cascade-panel绑定事件动作
        this._panel.each(function(index,element){
            var that = $(this),panel = that.children().eq(0);
            
            //添加默认顶部填充
            panel.css('padding-top',(that.height() - cascade._lineHeight) / 2),
            that.on('touchstart',function(e){
                var nowPos = e.originalEvent.touches[0];
                panel._startPos = {x:nowPos.pageX, y:nowPos.pageY};
                this._timer && clearInterval(this._timer); //清除旧定时器
            }).on('touchmove',function(e){
                e.preventDefault();
                var nowPos = e.originalEvent.touches[0]
                   ,offsetY = nowPos.pageY - panel._startPos.y;
                   
                //更新cascade-item位置
                panel.css({top: Math.min(0,Math.max(parseInt(panel.css('top')) + offsetY,-panel.height() + cascade._lineHeight))});
                
                //更新历史位置
                panel._startPos = {x:nowPos.pageX, y:nowPos.pageY};
            }).on('touchend touchcancel',function(){
                var that = this,nowPos = parseInt(panel.css('top')),odd = -(nowPos % cascade._lineHeight),nowIndex = parseInt(-nowPos / cascade._lineHeight);
                nowPos - this._lastGesture < 0 && odd > 10 && (nowIndex++);
                this._endNum = -(cascade._lineHeight * nowIndex);
                this._nowIndex = nowIndex;
                this._timer = setInterval(function(){
                    var val = parseInt(panel.css('top'));
                    if(val < that._endNum) val++; else val--;
                    panel.css('top', val);
                    if(val == that._endNum) clearInterval(that._timer); //动作结束，清楚定时器
                },10);
                this._lastGesture = nowPos;//更新手势坐标
                cascade._exec('change', {index:$(this).index() - 1,selectIndex: nowIndex});//发送事件
            });
        });
        this._control.on('click',function(e){if(e.target != this) return; $(this).hide();});
        this._input.on('focus', function(e){
            e.preventDefault();
            $(this).blur();
            cascade._control.show();
            cascade._container.css('bottom',-(cascade._container.height()));
            cascade._container.animate({bottom: 0},300);
            cascade.refresh();
        });
        this._enter.on('click',function(e){
            e.stopPropagation();
            
            var subStr = '';
            
            //遍历所有cascade-panel
            cascade._panel.each(function(index,element){
                subStr += ' ' + $(this).find('.cascade-item').eq(this._nowIndex || 0).text();
            });
            
            //更新input
            cascade._input.val(subStr.substr(1,subStr.length));
            cascade._control.hide();
            
            cascade._exec('enter');
        });
    }
    ,_exec: function(ev,params){
        var list = this._event[ev] || [];
        for(var i = 0;i < list.length;i++) list[i].call(this,params);
    }
    ,refresh: function(index){
        if(!index){
            this._panel.off();
            this._input.off();
            this._enter.off();
            this._init();
            return;
        }
        var panel = this._panel.eq(index);
        panel.children().eq(0).css('top',0);
        panel[0]._nowIndex = 0;
    }
    ,on: function(ev,fn){
        if(!this._event[ev]) this._event[ev] = [];
        this._event[ev].push(fn);
    }
    ,off: function(ev,fn){
        if(!fn){
            this._event[ev] = [];
            return;
        }
        var index = this._event[ev].indexOf(fn);
        if (index > -1) {
            this._event[ev].splice(index, 1);
        }
    }
    ,getSelectIndex: function(){
        var array = [];
        this._panel.each(function(index,element){
            array.push(this._nowIndex || 0);
        });
        return array;
    }
    ,getSelectText: function(index){
        if(index){
            var panel = this._panel.eq(index);
            return panel.find('.cascade-item').eq(panel[0]._nowIndex || 0).text();
        }
        var array = [];
        this._panel.each(function(index,element){
            array.push($(this).find('.cascade-item').eq(this._nowIndex || 0).text());
        });
        return array;
    }
};
for(var o in CascadeControlOption){
    CascadeControl.prototype[o] = CascadeControlOption[o];
}
(function($){
    $.fn.cascade = function(panel){
        return new CascadeControl(panel,this);
    };
})($ || jQuery);