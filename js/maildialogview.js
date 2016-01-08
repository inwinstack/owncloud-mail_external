(function() {
	if (!OC.Share) {
		OC.Share = {};
	}


	var PASSWORD_PLACEHOLDER_MESSAGE = t('core', 'Choose a password for the public link');

	var TEMPLATE =
			// currently expiration is only effective for link share.
			// this is about to change in future. Therefore this is not included
			// in the LinkShareView to ease reusing it in future. Then,
			// modifications (getting rid of IDs) are still necessary.
            '   {{#if allowShared}}' +
            '   {{#if passwordEnforce}}' + 
            ' <div id="mailPassword"> ' +
            '<input type="checkbox" name="showPassword" id="showPassword" class="checkbox showPasswordCheckbox" value="1" />' +
			'<label for="showPassword">{{enablePasswordLabel}}</label>' +
            '   {{/if}}' +
			'<div id="linkPass" class="linkPass {{#if passwordEnforce}}hidden{{/if}}">' +
			'    <label for="linkPassText" class="hidden-visually">{{passwordLabel}}</label>' +
			'    <input id="linkPassText" class="linkPassText" type="password" placeholder="{{passwordPlaceholder}}" />' +
			'    <span class="icon-loading-small hidden"></span>' +
			'</div></div>'+ 
            ' <div id="mailExpiration"> ' +
			'<input type="checkbox" name="expirationCheckbox" class="expirationCheckbox checkbox" id="expirationCheckbox" value="1" ' +
				'{{#if isExpirationEnforced}}checked="checked"{{/if}} {{#if disableCheckbox}}disabled="disabled"{{/if}} />' +
			'<label for="expirationCheckbox">{{setExpirationLabel}}</label>' +
			'<div class="expirationDateContainer {{#unless isExpirationEnforced}}hidden{{/unless}}">' +
			'    <label for="expirationDate" class="hidden-visually" value="{{expirationDate}}">{{expirationLabel}}</label>' +
			'    <input id="expirationDate" class="datepicker" type="text" placeholder="{{expirationDatePlaceholder}}" value="{{expirationValue}}" />' +
			'</div></div>' +
			'<input type="submit" id="MailExternalSend"> {{/if}}' 
		;

      

	/**
	 * @class OCA.Share.ShareDialogExpirationView
	 * @member {OC.Share.ShareItemModel} model
	 * @member {jQuery} $el
	 * @memberof OCA.Sharing
	 * @classdesc
	 *
	 * Represents the expiration part in the GUI of the share dialogue
	 *
	 */
	var MailDialogView = OC.Backbone.View.extend({
		/** @type {string} **/
		id: 'MailDialog',

        className: 'menu hidden',

		/** @type {OC.Share.ShareConfigModel} **/
		configModel: undefined,

		/** @type {Function} **/
		_template: undefined,

		/** @type {boolean} **/
		showLink: true,

		events: {
			'change .expirationCheckbox': '_onToggleExpiration',
			'change .datepicker': '_onChangeExpirationDate',
            'click #MailExternalSend': '_sendMail',
			'click .showPasswordCheckbox': 'onShowPasswordClick',
			'focusout input.linkPassText': 'onPasswordEntered',
		},

		initialize: function(options) {
			if(!_.isUndefined(options.configModel)) {
				this.configModel = options.configModel;
			} else {
				throw 'missing OC.Share.ShareConfigModel';
		    }
			var view = this;

		},

		_onToggleExpiration: function(event) {
			var $checkbox = $(event.target);
			var state = $checkbox.prop('checked');
			// TODO: slide animation
			this.$el.find('.expirationDateContainer').toggleClass('hidden', !state);
			if (!state) {
				// discard expiration date
				this.model.setExpirationDate('');
			}
		},

		_onChangeExpirationDate: function(event) {
			var $target = $(event.target);
			$target.tooltip('hide');
			$target.removeClass('error');

			this.model.setExpirationDate($target.val());
		},

        onShowPasswordClick: function() {
			this.$el.find('.linkPass').slideToggle(OC.menuSpeed);
			if(!this.$el.find('.showPasswordCheckbox').is(':checked')) {
				this.model.setPassword('');
			} else {
				this.$el.find('.linkPassText').focus();
			}
		},

        onPasswordEntered: function() {
			var self = this;
			var $loading = this.$el.find('.linkPass .icon-loading-small');
			if (!$loading.hasClass('hidden')) {
				// still in process
				return;
			}
			var $input = this.$el.find('.linkPassText');
			$input.removeClass('error');
			var password = $input.val();
			// in IE9 the password might be the placeholder due to bugs in the placeholders polyfill
			if(password === '' || password === PASSWORD_PLACEHOLDER_MESSAGE) {
				return;
			}

			this.model.setPassword(password);
		},

        _sendMail: function(event) {
            if(!this.model.hasPassword() && this.configModel.get('enforcePasswordForPublicLink')){
                OC.Notification.showTemporary(t('mail_external', 'Please input your password'));
                return;
            }
            this.model.getToken();
            this.reloadShareIcon();
            
            state = this.$el.hasClass('hidden');
            this.$el.toggleClass('hidden', !state);
        },

        reloadShareTabView : function() {
            FileList._detailsView._tabViews.filter(function(tab) { 
                return tab.id == 'shareTabView'; 
            })[0].render();
        },

        reloadShareIcon : function() {
            selectedFiles = FileList.getSelectedFiles();
            for(i = 0; i < selectedFiles.length; i++){
                fileName = selectedFiles[i].name;
                tr = FileList.findFileEl(fileName, true, true);
                OC.Share.markFileAsShared(tr, true, true);
            }
            this.reloadShareTabView();
        },


		render: function() {
            notAllowSharedFiles = this.model.checkShareFilesPermission();
            var notAllowShared = (notAllowSharedFiles.length !== 0);

			var defaultExpireMessage = '';
			var defaultExpireDays = this.configModel.get('defaultExpireDate');
			var isExpirationEnforced = this.configModel.get('isDefaultExpireDateEnforced');

			var isExpirationSet = !!this.model.get('linkShare').expiration;

			var expiration;

            if (isExpirationEnforced) {
				expiration = moment(this.configModel.getDefaultExpirationDateString(), 'YYYY-MM-DD').format('DD-MM-YYYY');
			}

			if (isExpirationSet) {
				expiration = moment(this.model.get('linkShare').expiration, 'YYYY-MM-DD').format('DD-MM-YYYY');
			}
            var passwordEnforce = !this.configModel.get('enforcePasswordForPublicLink');

			this.$el.html(this.template({
                passwordEnforce: passwordEnforce, 
				setExpirationLabel: t('core', 'Set expiration date'),
				expirationLabel: t('core', 'Expiration'),
				expirationDatePlaceholder: t('core', 'Expiration date'),
				passwordLabel: t('core', 'Password'),
                enablePasswordLabel: t('core', 'Password protect'),
                passwordPlaceholder: PASSWORD_PLACEHOLDER_MESSAGE,
				isLinkShare: this.model.get('linkShare').isLinkShare,
				isExpirationSet: isExpirationSet,
				isExpirationEnforced: isExpirationEnforced,
				disableCheckbox: isExpirationEnforced && isExpirationSet,
				expirationValue: expiration,
                allowShared: !notAllowShared,
			}));

            if(notAllowShared) {
                ul = $('<ul>');
                $.each(notAllowSharedFiles, function(i) {
                    var li = $('<li>');
                    li.append('*'+notAllowSharedFiles[i]);
                    ul.append(li);
                });
                this.$el.append(t('mail_external', 'These files or folders can not be shared'));
                this.$el.append(ul);
                return this;
            }
			// what if there is another date picker on that page?
			var minDate = new Date();
			var maxDate = null;
			// min date should always be the next day
			minDate.setDate(minDate.getDate()+1);

			if(isExpirationSet) {
				if(isExpirationEnforced) {
					// TODO: hack: backend returns string instead of integer
					var shareTime = this.model.get('linkShare').stime;
					if (_.isNumber(shareTime)) {
						shareTime = new Date(shareTime * 1000);
					}
					if (!shareTime) {
						shareTime = new Date(); // now
					}
					shareTime = OC.Util.stripTime(shareTime).getTime();
					maxDate = new Date(shareTime + defaultExpireDays * 24 * 3600 * 1000);
				}
			}
			$.datepicker.setDefaults({
				minDate: minDate,
				maxDate: maxDate
			});

            // TODO drop with IE8 drop
			if($('html').hasClass('ie8')) {
				this.$el.find('#linkPassText').removeAttr('placeholder');
				this.$el.find('#linkPassText').val('');
			}

			this.$el.find('.datepicker').datepicker({
                dateFormat : 'dd-mm-yy',
                beforeShow: function() {
                    $(this).datepicker("widget").addClass("menu");
                },
                onClose: function() {
                    $(this).datepicker("widget").removeClass("menu");
                }
            });

			this.delegateEvents();

			return this;
		},

        show: function(){
            this.$el.removeClass('hidden');

            OC.showMenu(null, this.$el);
        },
		/**
		 * @returns {Function} from Handlebars
		 * @private
		 */
		template: function (data) {
			if (!this._template) {
				this._template = Handlebars.compile(TEMPLATE);
			}
			return this._template(data);
		}

	});

	OCA.MailDialogView = MailDialogView;

})();
