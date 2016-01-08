/**
 * ownCloud - mail_external
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Dino Peng <dino.p@inwinstack.com>
 * @copyright Dino Peng 2015
 */

(function ($, OC) {


	$(document).ready(function () {        
        var img = OC.imagePath('core','actions/play');
        var el = $('#app-content-files #headerName .selectedActions');
        $('<a class="mailexternal" id="send" href=""><img class="svg" src="'+img+'" alt="'+t('mail_external','Send')+'">'+t(this.appName,'Send')+'</a>').appendTo(el);
	    var configModel = new OC.Share.ShareConfigModel();
        var mailModel = new OCA.MailDialogModel({configModel});
        var mailDialogView = new OCA.MailDialogView({configModel : configModel, model : mailModel});
        
        el.find('#send').click(function(event){
            event.stopPropagation(); 
            event.preventDefault();
            var $dialog = mailDialogView.render().$el;
            $dialog.appendTo('#app-content-files #headerName .selectedActions');

            mailDialogView.show();
        });
        
    });

})(jQuery, OC);
