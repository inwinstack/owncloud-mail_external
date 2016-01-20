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

use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

class ProfileController extends Controller {
    
    public function getUserEmail(){
        $uid = \OC_User::getUser();
        $userEmail = \OC::$server->getConfig()->getUserValue($uid, 'settings', 'email');
        return new DataResponse($userEmail);
    }
}
