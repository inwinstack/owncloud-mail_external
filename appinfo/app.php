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

namespace OCA\Mail_External\AppInfo;


\OCP\Util::addScript('mail_external', 'main');
\OCP\Util::addScript('mail_external', 'maildialogview');
\OCP\Util::addScript('mail_external', 'maildialogmodel');
\OCP\Util::addStyle( 'mail_external', "style"); 
