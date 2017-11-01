

(function (w) {

	w.Api = {
		_api:{},
		ajax:function (options,url,type,e) {
			options.json=options.json||{};
			if (Api._api[url]) {
				return false;
			}
			Api._api[url] = true;
			layer.close(Api.shade);		
			Api.shade = layer.load(0, {
				shade: [0.3,'#fff'] //0.1透明度的白色背景
			});
			$.ajax({
				type:options.type?options.type:'get',
				url:options.url,
				data:options.json,
				success:function (res) {
					layer.close(Api.shade);		
					Api._api[url] = false;
					console.log(res);
					if (res.success) {
						options.fn&&options.fn(res.data);
					} else {
						uselayer(1,res.msg);
					}
				},
				error:function (json) {
					layer.close(Api.shade);			
					Api._api[url] = false;		
					console.log(json);
					if (json.status==401) {
						alert("登录失效， 请重新登录。");
					} else if (json.status==500) {
						alert("服务器内部错误，请稍后再试。");		
					} else {
						var _txt = eval('('+json.responseText+')');
						alert(_txt.error);
					}				
				}
			});						
		},
			
		aaa:'123'
		
	};
	
	
	//公用弹窗方法
	w.uselayer = function (type,str,fn,fn2) {
		var layerindex = null;
		switch (type){
			case 1:
				layerindex = layer.alert(str,layerfn);			
				break;
			case 2:
				layerindex = layer.confirm(str,layerfn);			
				break;
			case 3:
				layerindex = layer.msg(str,{time:2000,skin:'msg-error center',icon:2},layerfn);			
				break;
			case 31:
				layerindex = layer.msg(str,{time:2000,skin:'msg-success center',icon:1},layerfn);			
				break;
			default:
				break;
		}
		function layerfn() {
			layer.close(layerindex);
			fn&&fn();
		};
		return layerindex;
	};	
	w.uselayeropen = function (options) {
		options.title = options.title||'';
		options.width = options.width||$(window).width()*0.6+'px';
		options.height = options.height||$(window).height()*0.8+'px';
//		$('body').css({'width':'100%','height':'100%','overflow':'hidden'});
		var layerindex = layer.open({
						type: 1,
						title: options.title,
						closeBtn: 1,
						shadeClose:true,
						area: [options.width,options.height],
						content: options.obj, 
						success:function () {
							$(document).scroll(function (e) {
								e.preventDefault()
								return false;
								
							});
							options.fn&&options.fn();
						},
						end:function () {
//							$('body').css({'width':'auto','height':'auto','overflow':'auto'});
							options.end&&options.end();
						}
					});	
		return layerindex;
	};	
		
	
	

	
	
	
	
	
	
})(window)

$.fn.myCombo = function (options) {

	if (!options.idField||!options.textField||!options.url) {
		uselayer(1,'myCombo参数配置错误！！！');
		return false;
	}
	options.width = options.width||'auto';
	options.height = options.height||'auto';
	options.mincharlen = options.mincharlen||'0';
	
	
	
	var obj = this;
	var special_keys = {
		27: "esc",
		9: "tab",
//		32: "space",
		13: "return",
//		8: "backspace",
		145: "scroll",
		20: "capslock",
		144: "numlock",
		19: "pause",
		45: "insert",
		36: "home",
		46: "del",
		35: "end",
		33: "pageup",
		34: "pagedown",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		112: "f1",
		113: "f2",
		114: "f3",
		115: "f4",
		116: "f5",
		117: "f6",
		118: "f7",
		119: "f8",
		120: "f9",
		121: "f10",
		122: "f11",
		123: "f12"
	};

	if (parseInt(options.mincharlen)==0) {
		$(this).focus(mycombouseajax);
	} else {
		$(obj).keyup(function () {
			if ($(obj).val().length>=parseInt(options.mincharlen)) {
				mycombouseajax();
			}
		});
	};

	function mycombouseajax() {
		options.beforeInit&&options.beforeInit();
		Api.ajax({
			url:options.url,
			fn:function (res) {
				console.log(res);
				
				$('#messagelist').css({'width':options.width,'height':options.height});
				
				if ($(obj).offset().left+$('#messagelist').width()>$(document).width()) {
					$('#messagelist').css({'left':'auto','right':$(document).width()-4-$(obj).offset().left-$(obj).width()+'px','top':$(obj).height()+$(obj).offset().top+'px'});
				} else {
					$('#messagelist').css({'left':'auto','left':$(obj).offset().left+'px','top':$(obj).height()+$(obj).offset().top+'px'});
				}
				var arr = [];
				for (var i = 0 ; i <res.length;i++) {
					arr.push({'code':res[i][options.idField],'name':res[i][options.textField]});
				}
				mysel(obj,arr);
		
				
				$(obj).keydown(function (e) {
					var num = $('#messagelist').attr('num');
					if (e.keyCode==38||e.keyCode==40) {
						if (e.keyCode==38) {
							num--;
							if (num<0) {
								num=0;
							}
						}
						if (e.keyCode==40) {
							num++;
							if (num>=$('#messagelist li').length) {
								num=$('#messagelist li').length-1;
							}
						}
						$('#messagelist li').removeClass('active');
						$('#messagelist').attr('num',num);
						$('#messagelist li').eq(num).addClass('active');
						if (num<10) {
							$('#messagelist').scrollTop(0);
						} else if (num>=10) {
							$('#messagelist').scrollTop((num-9)*26);
						}
						
					}
					if (e.keyCode==13||e.keyCode==9) {
						clicknext(obj);
						return false;
					}
					if (e.keyCode==27) {
						hideauto(obj);
						prevauto(obj);
						return false;
					}
				});
				
				$(obj).keyup(function (e) {
					if (special_keys[e.keyCode]) {
						return false;
					}
					mysel(obj,arr);
				});
				$('#messagelist').css('display','block');
				$(obj).blur(function () {
					hideauto(obj);
				});
			}
		});		
	};

	function mysel(obj,arr) {
		var val = $.trim($(obj).val());
		val = val.replace('(','').replace(')','');
		if (val=='') {
			writelist(obj,arr);
			return false;	
		} 
		var _arr = [];
		for (var i = 0 ; i < arr.length; i++ ) {
			if (arr[i].code.search(val)!=-1) {
				_arr.push({'code':arr[i].code.replace(val,'<strong>'+val+'</strong>'),'name':arr[i].name});
				continue;
			}
			if (arr[i].name.search(val)!=-1) {
				_arr.push({'name':arr[i].name.replace(val,'<strong>'+val+'</strong>'),'code':arr[i].code});
				continue;
			}
		}					
		writelist(obj,_arr);
	};
	
	function writelist(obj,arr) {
		if (arr.length==0) {
			$('#messagelist').html('<p class="no-data">无相关数据</p>');
			return false;
		}
		var str = '';
		for (var i = 0 ; i < arr.length; i++) {
			str+='<li title="'+arr[i].name+'"><span class="codespan">'+arr[i].code+'</span><span class="namespan">'+arr[i].name+'</span></li>';
			
		}
		$('#messagelist').html(str);
		$('#messagelist').attr('num','0');
		$('#messagelist li').eq(0).addClass('active');
		
		$('#messagelist li').hover(function () {
			$('#messagelist').attr('num',$(this).index());
			$('#messagelist li').removeClass('active');
			$(this).addClass('active');
			
		});
		$('#messagelist li').mousedown(function () {
			$('#messagelist').attr('num',$(this).index());
			clicknext(obj);
			return false;
		});
		if ($('#messagelist li').length==1) {
			$('#messagelist li').eq(0).mousedown();
		}
	};
	
	function clicknext(obj) {
		var num = $('#messagelist').attr('num');

		if ($('#messagelist li').eq(num).length!=0) {
			var _codestr = $('#messagelist li').eq(num).find('.codespan').html();
			var _namestr = $('#messagelist li').eq(num).find('.namespan').html();
			_codestr = _codestr.replace(/<strong>|<\/strong>/gi,'');
			_namestr = _namestr.replace(/<strong>|<\/strong>/gi,'');
			$(obj).val(_namestr+'('+_codestr+')');
		}
		options.afterSelect&&options.afterSelect();
		hideauto(obj);
		nextauto(obj);
		return false;					
	};
	function hideauto(prev) {
		$('#messagelist').attr('num','0');
		$('#messagelist').css('display','none');
		$('#messagelist').html('');
	};
	
	function nextauto(obj) {
		
		if ($('.autonext').eq($(obj).index('.autonext')+1).length!=0) {
			$('.autonext').eq($(obj).index('.autonext')+1).focus();
		}
	};
	function prevauto(obj) {
		if ($(obj).index('.autonext')-1>=0) {
			$('.autonext').eq($(obj).index('.autonext')-1).focus();
		}
	};

	
};




