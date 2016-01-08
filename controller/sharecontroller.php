<?php
/**
 * ownCloud - mail_external
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Dino Peng <dino.p@inwinstack.com>
 * @copyright Dino Peng 2015
 */

namespace OCA\Mail_External\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

class ShareController extends Controller {


	public function __construct($AppName, IRequest $request){
		parent::__construct($AppName, $request);
	}

    public function shareLinks($data, $shareWith){
        $tokens = array();
        $uid = \OC_User::getUser();
        $userEmail = \OC::$server->getConfig()->getUserValue($uid, 'settings', 'email');
        $tokens['email'] = $userEmail;
        for($i = 0; $i < sizeof($data); $i++){
            $itemType = $data[$i]['itemType'];
            $itemSource = $data[$i]['itemSource'];
            $itemSourceName = $data[$i]['itemSourceName'];
            $permissions = $data[$i]['permissions'];
        
            $shareType = \OCP\Share::SHARE_TYPE_LINK;
            $password = null;
            $passwordChanged = ($shareWith['passwordChanged'] === 'true');
            if ($shareWith['password'] === '') {
                $shareWith = null;
            } 
            else {
                $password = $shareWith['password'];
            }
            file_put_contents("test.txt", $passwordChanged); 
            $token = \OCP\Share::shareItem(
                $itemType,
                $itemSource,
                $shareType,
                $password,
                $permissions,
                $itemSourceName,
                (!empty($_POST['expirationDate']) ? new \DateTime((string)$_POST['expirationDate']) : null),
                $passwordChanged
            );
            $tokens[$itemSourceName] = $token;
        }
        json_encode($tokens, JSON_PRETTY_PRINT);
        return new DataResponse($tokens);
    }
}
