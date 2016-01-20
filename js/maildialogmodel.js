/*
 * Copyright (c) 2015
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 *
 * See the COPYING-README file.
 *
 */

(function() {
	if (!OC.Share) {
		OC.Share = {};
		OC.Share.Types = {};
	}

    var mailUrl = 'http://172.20.3.82/test.php';

	// FIXME: the config model should populate its own model attributes based on
	// the old DOM-based config
	var MailDialogModel = OC.Backbone.Model.extend({
        
        initialize: function(options) {
			if(!_.isUndefined(options.configModel)) {
				this.configModel = options.configModel;
			}
		},

		defaults: {
			publicUploadEnabled: false,
			enforcePasswordForPublicLink: oc_appconfig.core.enforcePasswordForPublicLink,
			isDefaultExpireDateEnforced: oc_appconfig.core.defaultExpireDateEnforced === true,
			isDefaultExpireDateEnabled: oc_appconfig.core.defaultExpireDateEnabled === true,
			isRemoteShareAllowed: oc_appconfig.core.remoteShareAllowed,
			defaultExpireDate: oc_appconfig.core.defaultExpireDate,
			isResharingAllowed: oc_appconfig.core.resharingAllowed,
            linkShare: {}
		},

        

		isShareWithLinkAllowed: function() {
			return $('#allowShareWithLink').val() === 'yes';
		},
        /**
		 * Sets the expiration date of the public link
		 *
		 * @param {string} expiration expiration date
		 */
		setExpirationDate: function(expiration) {
			this.get('linkShare').expiration = expiration;
		},

		/**
		 * Set password of the public link share
		 *
		 * @param {string} password
		 */
		setPassword: function(password) {
			this.get('linkShare').password = password;
			this.get('linkShare').passwordChanged = true;
		},

        hasPassword: function(){
            if(this.get('linkShare').password == '' || this.get('linkShare').password == undefined){
            return false;
            }

            return true;
        },

        getShareFiles : function() {
            var files = FileList.getSelectedFiles();
            var sharefiles = [];
            for(var i = 0; i < files.length; i++) {
                sharePermissions = files[i].permissions;                  
                if (files[i].mountType && files[i].mountType === "external-root"){
                    sharePermissions = sharePermissions | (OC.PERMISSION_ALL & ~OC.PERMISSION_SHARE);
                }
                if(files[i].type === 'file') {
                   sharePermissions = sharePermissions & ~OC.PERMISSION_DELETE;
                }
                if(files[i].type === 'dir') {
                    files[i].type = 'folder';
                }
                sharefiles[i] = {
                    type: files[i].type,
                    id: files[i].id,
                    name: files[i].name,
                    permissions: sharePermissions
                };
            }
            return sharefiles;
	    },

        checkShareFilesPermission : function() {
            sharefiles = this.getShareFiles();
            var notAllowSharedFiles = [];
            for(var i = 0; i < sharefiles.length; i++) {
                if(sharefiles[i].permissions == 3) {
                    notAllowSharedFiles.push(sharefiles[i].itemSourceName);
                }
            }
            return notAllowSharedFiles;
        },

        OpenWindowWithPost : function (url, params) {

            params = JSON.stringify(params);
            var form = $('<form>');
            form.attr('id', 'mail_external_form');
            form.attr('method', 'post');
            form.attr('action', url);
            form.attr('target', '_blank');
 
            var input = $('<input>');
            input.attr('name', 'data');
            input.attr('type', 'hidden');
            input.attr('value', params);
            form.append(input);
            
            $('body').append(form);
            
            form.submit();
          
            $('#mail_external_form').remove();
        },
        
        getToken : function(attributes) {
            var model = this;

			// TODO: use backbone's default value mechanism once this is a separate model
			var requiredAttributes = [
				{ name: 'password', defaultValue: '' },
				{ name: 'passwordChanged', defaultValue: false },
				{ name: 'permissions', defaultValue: OC.PERMISSION_READ },
				{ name: 'expiration', defaultValue: this.configModel.getDefaultExpirationDateString() }
			];

			attributes = attributes || {};

			// get attributes from the model and fill in with default values
			_.each(requiredAttributes, function(attribute) {
				// a provided options overrides a present value of the link
				// share. If neither is given, the default value is used.
				if(_.isUndefined(attribute[attribute.name])) {
					attributes[attribute.name] = attribute.defaultValue;
					var currentValue = model.get('linkShare')[attribute.name];
					if(!_.isUndefined(currentValue)) {
						attributes[attribute.name] = currentValue;
					}
				}
			});

            var data = this.getShareFiles();
            var shareWith = {
				password: attributes.password,
				passwordChanged: attributes.passwordChanged
			};

            shareUrl = window.location.protocol + '//' + window.location.host + OC.generateUrl('/s/');

            var getShareToken = $.ajax({
                method:'POST',
                url: OC.generateUrl('/apps/files_sharing_ext/shareLinks'),
                data: {
                    data : data,
                    password : shareWith,
                    expiration : attributes.expiration 
                },
                success: function(response) {
                    $.each(response, function(key, value){
                            response[key] = shareUrl + value;
                    })
                },
            });

            var getUserEmail = $.ajax({
                method:'GET',
                url: OC.generateUrl('/apps/mail_external/getUserEmail'),
            });

            $.when(getUserEmail, getShareToken).done(function (response1, response2) {
                var response = [];
                response.push(response1[0]);
                response.push(response2[0]);
                model.OpenWindowWithPost(mailUrl, response);
            });
                    
            this.setPassword('');
            this.setExpirationDate('');
        }
	});


	OCA.MailDialogModel = MailDialogModel;
})();
