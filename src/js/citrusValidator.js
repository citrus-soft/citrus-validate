
/*=========================
  citrusValidator
  ===========================*/

window.citrusValidator = function (form, options) {
	if(!form || form.length != 1) throw new Error("citrusValidator: ошибка в аргументе form");

	var v 			= this,
		obRules 	= Object.create(v._getRule()),
		obMessages 	= Object.create(v._getMessage()),
		obEvents 	= Object.create(v._getEvent());

	v.settings = $.extend({
            'submitBtn': ':submit',
            'input_container': ".input-container",
			'checkInit': true
	    }, options);
	v.$form = form;
	v.$submitBtn = v.$form.find(v.settings.submitBtn);
	v.fields = [];
    v.requireGroup = {};
	v.isLocked = false;

  	v.getMessage = function(messageName, arParams){
  		var message = this.messages && this.messages[messageName] ? this.messages[messageName] :  obMessages[messageName] ? obMessages[messageName] : "";

		if(message.length > 0 && $.type(arParams) === "array" && arParams.length > 0) {
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});
		}
		return message;
	};
	v.setMessage = function(messages, messageText){
		if(arguments.length === 1 && $.isPlainObject(messages) && !$.isEmptyObject(messages)) {
			for (var prName in messages) {
				if(typeof messages[prName] !== "string") return false;
				obMessages[prName] = messages[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof messages === "string" && typeof messageText === "string") {
			obMessages[messages] = messageText;
			return true;
		}
		return false;
	};
	v.getRule = function(ruleName){
		return !ruleName ? obRules: obRules[ruleName] || false;
	};
	v.setRule = function(rules, fn){
		if(arguments.length === 1 && $.isPlainObject(rules) && !$.isEmptyObject(rules)) {
			for (var prName in rules) {
				if(!$.isFunction(rules[prName])) return false;
				obRules[prName] = rules[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof rules === "string" && $.isFunction(fn)) {
			obRules[rules] = fn;
			return true;
		}
		return false;
	};
	v.getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || false;
	};
	v.setEvent = function(events, fn){
		if(arguments.length === 1 && $.isPlainObject(events) && !$.isEmptyObject(events)) {
			for (var prName in events) {
				if(typeof prName !== "string" || !$.isFunction(events[prName])) return false;
				obEvents[prName] = events[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof events === "string" && $.isFunction(fn)) {
			obEvents[events] = fn;
			return true;
		}
		return false;
	};
	v.callEvent = function(eventName, arg1, arg2){
		if( !eventName ) return;
		this.getEvent(eventName).call(this, arg1, arg2);
		return this;
	};

	//Работа с массивом v.fields
  	v.getField = function($fields){
  		if(!$fields) return v.fields;
  		return v.fields.filter(function(item) {
		  return $(item.$el).is($fields);
		});
  	};
  	v.filterField = function(fn){
  		if(!fn || !$.isFunction(fn)) throw new Error("citrusValidator: ошибка в аргументе функции filterField");
  		return v.fields.filter(fn);
  	};

	//Vfield массив из функции getField
  	v.validateField = function(Vfield, action, callback){
  		var Vfields = [].concat(Vfield),
  			action = action === undefined ? true : action,
  			callback = callback || function(){};

        Vfields.forEach(function(Vfield){
  			var arRulesLength = Vfield.arRules.length,
  				arErrors = [];

			var onComplete = function () {
                Vfield.errors = arErrors;
				if(!Vfield.params.trigger && !Vfield.$el.is(":checkbox, :file, :radio, select") ) Vfield.params.trigger = "input";

				if (arErrors.length > 0 ) {
					if(action) v.callEvent("addFieldError", Vfield.$el, arErrors);
					Vfield.$el.trigger("validError", [Vfield]);
					Vfield.isValid = false;
				} else {
					if( !Vfield.$el.is(":checkbox, :radio") && !Vfield.$el.val() ) {
						if(action) v.callEvent("clearField", Vfield.$el);
						delete  Vfield.isValid;
					}else {
						if(action) v.callEvent("removeFieldError", Vfield.$el);
						Vfield.$el.trigger("validSucess", [Vfield]);
						Vfield.isValid = true;
					}
				}
				callback(Vfield, arErrors);
			};
			if( Vfield.$el.prop("disabled") ) {
  				if(action) v.callEvent("clearField", Vfield.$el);
				delete Vfield.isValid;
				onComplete ();
				return;
  			}
			if(!arRulesLength) {onComplete(); return true;}
  			Vfield.arRules.forEach(function(rule) {
  				var fnRule = v.getRule(rule);
	  			if(!fnRule || !$.isFunction(fnRule)) {
	  				console.warn("citrusValidator: Нет правила '"+rule+ "'");

	  				if(!(--arRulesLength)) onComplete();
	  				return true;
	  			}

	  			fnRule.call( v, Vfield, function(Vfield, errors){
	  				if(!!errors && !!errors.length) arErrors[arErrors.length] = errors;

	  				if(!(--arRulesLength)) onComplete();
	  			});
	  			return true;
	  		});
  		});
  	};
  	v.validateGroup = function (groupId, action, callback) {
        if(!groupId) return;
        var callback = callback || function () {};
        var action = typeof action === "undefined" ? true : !!action;

        var isGroupOrValid = false,
	        isGroupAndValid = true,
	        isGroupValid = false,
	        logic = v.requireGroup[groupId]['logic'] || 'or';

        var VGroup = v.filterField(function(Vfield){ return Vfield.params.requireGroup == groupId});
        var arGroupNames = [];
        VGroup.forEach(function(Vfield, i, arr) {
            var fieldName = Vfield.params.name || Vfield.$el.attr("name");
            if(fieldName) arGroupNames.push(fieldName);
            var copyVfield = {};
            copyVfield["$el"] = Vfield.$el;
            copyVfield.arRules = ["required"];
            copyVfield.params = [];

            v.validateField(copyVfield, false, function (field, arErrors) {
                if(!arErrors.length) isGroupOrValid = true;
	            if(arErrors.length) isGroupAndValid = false;
            });
        });
	    isGroupValid = logic === 'or' && isGroupOrValid || logic === 'and' && isGroupAndValid;

        if (action) {
            //устанавливаем сообщение если нет
	        var names = arGroupNames.join(', ');
	        var message = logic === 'or' ? v.getMessage("orGroup", [names]) : logic === 'and' ? v.getMessage("andGroup" , [names]): "";
            if( !v.requireGroup[groupId]['error']) v.requireGroup[groupId]['error'] = message;

            v.requireGroup[groupId]['isValid'] = isGroupValid;
            v.callEvent(isGroupValid ? "removeGroupError" : "addGroupError", groupId, VGroup);
        }
        callback( isGroupValid, VGroup);
    };
  	v.validateForm = function( action, callback ) {
  		var callback = callback || function(){};
  		var action = typeof action === "undefined" ? true : !!action;
        v.isValid = true;
        var onComplete = function () {
            callback(v);
            if(action) v.callEvent("afterFormValidate");
            if(action) v.callEvent("scrollToFirstError");
        };

        //Валидация групп
        var isGroupValid = true;
        var currentGroup;
        if(!$.isEmptyObject(v.requireGroup)) {
            for( var groupId in v.requireGroup ){
                currentGroup = v.requireGroup[groupId];
                if( currentGroup['isValid'] === false ) {isGroupValid = false; continue;}
                v.validateGroup(groupId, true, function (currentValid) {
                    if(currentValid === false) isGroupValid = false;
                });
            }
        }



  		//Валидация полей
	    var countFields = v.fields.length;
	    if( !countFields ) {onComplete(); return true;}

		v.fields.forEach(function(Vfield) {
			if( Vfield.isValid !== undefined && Vfield.params["trigger"] !== "submit" ) {
				if(!Vfield.isValid) v.isValid = false;
				if(!(--countFields))  onComplete();

			} else {
				v.validateField(Vfield, action, function(Vfield){
					if(!Vfield.isValid && Vfield.isValid !== undefined) v.isValid = false;
                    if(!(--countFields))  onComplete();
				});
			}
		});
  	};
  	v.checkImportant = function(){
  		var important_fields = v.filterField(function(field){return !!field.params["important"]});

		var importantIsvalid = true;
		if(important_fields.length > 0) {
			important_fields.forEach(function(Vfield) {
				if( Vfield.isValid !== undefined ) {
					if ( !Vfield.isValid ) importantIsvalid = false;
					return;
				} else {
					v.validateField(Vfield, false, function(Vfield) {
						if ( !Vfield.isValid ) importantIsvalid = false;
					});
				}
			});
		}
		return importantIsvalid;
  	};
  	v.addField = function($fields, arRules, params, messages){
  		if(!$fields || $.type($fields) !=="object" || !$fields.length ) {console.error("citrusValidator. v.addField(): $fields не найден"); return;}

  		var arRules = arRules || [],
  			params = params || {},
  		    messages = messages || {};

  		$fields.each(function(index, field) {
  			var $el = $(this).prop("type") == "radio" ? $('[name="' + $(this).prop("name") + '"]') : $(this);

  			//проверка на наличие уже в массиве этих полей
  			var findedField = v.getField($(field));
  			if(findedField.length) {
  				findedField = findedField[0];
  				//если поле уже в массиве полей то сливаем правила и параметры
  				findedField.arRules = $.unique( $.merge( findedField.arRules.slice(), arRules) );
  				findedField.params = $.extend( true, findedField.params, params );
  				findedField.messages = $.extend( true, findedField.messages, messages );
  				return;
  			}
            var Vfield = {
                $el: $el,
                arRules: arRules,
                params: params,
                messages: messages
            };
			v.fields[v.fields.length] = Vfield;

			//добавим группу в v.reqiureGroup
            if( Vfield.params.requireGroup ) {
            	if (!v.requireGroup[Vfield.params.requireGroup]) v.requireGroup[Vfield.params.requireGroup] = {"isValid": undefined, "error": ""};
            	if (Vfield.params.groupLogic) v.requireGroup[Vfield.params.requireGroup]['logic'] = Vfield.params.groupLogic;
            }

		    $el.on( v.handlers.field )
			    .data('validator-handlers-attached', true);
  		});
  		return $fields;
  	};

  	v.handlers = {
  		field: {
		    //обрабатываются события change и keyup. По умолчанию change меняется на keyup после первой валидации. Можно установить через data-validate-trigger у каждого поля
		    'change keyup validate input': function(event) {
			    if( event.keyCode == 13 ) return;
			    var Vfield = v.getField($(this))[0] || false;
			    if(!Vfield) {console.error("Нет поля в массиве полей v.fields");return;}
			    var validateTrigger = Vfield["params"]["trigger"] || "change";
			    if( validateTrigger.indexOf(event.type) < 0 && event.type !== 'validate'  ) return;

			    //validate filed requireGroup
			    if(Vfield.params.requireGroup)
				    v.validateGroup(Vfield.params.requireGroup, true);

			    v.validateField(Vfield, true, function(Vfield){
				    if(!!Vfield.params.important) {
					    v.callEvent(v.checkImportant() ? "unlockForm":"lockForm");
				    }
			    });
		    }
	    },
	    form: {
  			//запуск валидации по триггеру
		    'validate': function(event){
			    if($(event.target) == self.$form)  v.validateForm;
		    },
		    //обработка нажатий enter в форме
		    'keypress': function(event){
			    if( event.keyCode == 13 && event.target.type !== "textarea") {
				    event.preventDefault();
				    v.validateForm();
			    }
		    }
	    },
	    btn: {
		    //обрабаываем клик на сабмит
  			'click': function(event) {
			    event.preventDefault();
			    if(!$(this).attr("disabled")) v.validateForm();
		    }
	    }
    };
  	v.checkAttached = function ($el) {
  		var ifAttached = $el.data('validator-handlers-attached') === true;
  		if (ifAttached) console.warn('handler already attached');
		return ifAttached;
    };
  	v.attachEvents = function (attacheFields) {
	    if (!v.checkAttached(v.$form)) {
	    	v.$form.on( v.handlers.form )
			        .data('validator-handlers-attached', true);
	    }

	    if (!v.checkAttached(v.$submitBtn)) {
		    v.$submitBtn.on( v.handlers.btn )
			            .data('validator-handlers-attached', true);
	    }

	    if (isset(attacheFields) && attacheFields !== false) {
		    $(v.fields).each(function (index, field) {
			    field.$el.each(function (index, el) {
				    if (!v.checkAttached($(el))) {
					    $(el).on( v.handlers.field )
						    .data('validator-handlers-attached', true);
				    }
			    });
		    });
	    }
    };
  	v.detachEvents = function () {
	    v.$form.off( v.handlers.form )
		    .data('validator-handlers-attached', false);
	    v.$submitBtn.off(v.handlers.btn)
		    .data('validator-handlers-attached', false);

	    $(v.fields).each(function (index, field) {
		    field.$el.each(function (index, el) {
			    $(el).off( v.handlers.field )
				    .data('validator-handlers-attached', false);
		    });
	    });
    };
  	v.destroy = function () {
  		v.detachEvents();
  		v._removeValidator(v);
		v.fields = [];
    };
  	v.init = function () {
	    //add field by data params
	    v.$form.find('[data-valid], [data-valid-params], [data-valid-messages]').each(function(index, el) {
		    var allData = $(el).data();
		    var arRules = allData["valid"] ? allData["valid"].split(" ") : [];
		    var params = allData["validParams"] || {};
		    var messages = allData["validMessages"] || {};

		    for (var dataName in allData) {
			    if (dataName.indexOf('validParam')+1) {
				    var paramName = dataName.replace('validParam', '');
				    if ( paramName[0] === paramName[0].toUpperCase()) {
					    paramName = paramName.toLowerCase();
					    params[paramName] = allData[dataName];
				    }
			    }
			    if (dataName.indexOf('validMessage')+1) {
				    var messageName = dataName.replace('validMessage', '');
				    if ( messageName[0] === messageName[0].toUpperCase()) {
					    messageName = messageName.toLowerCase();
					    messages[messageName] = allData[dataName];
				    }
			    }
		    }

		    if ( arRules.length || !$.isEmptyObject(params) || !$.isEmptyObject(messages)) v.addField( $(el), arRules, params, messages );
	    });

	    //check important
	    if(!v.checkImportant()) v.callEvent("lockForm");
	    v.attachEvents(false);
	    v._addValidator(v);
    };
  	;(function () {
		//check init
		var arValidator = proto._getValidator(v.$form);
		if (arValidator.length) {
			if (v.settings.checkInit) {
				console.warn('Validator already init'); return;
			} else {
				v._removeValidator(arValidator);
			}
		}
		v.init();
	}());
};