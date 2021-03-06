/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

'use strict';
import * as vscode from 'vscode';
import { CloudAccountApi } from '../interfaces/cloud-account-api';

/*
 * This file will hold functions to allow interaction with other extensions.
 */
export class ExtensionsInteractionUtil {

    public static async cloudAccountGetAccessToken(userInteraction: boolean = true): Promise<string> {
        const  cloudAccountExtension: vscode.Extension<any> = vscode.extensions.getExtension( 'IBM.ibmcloud-account' );
        if ( !cloudAccountExtension ) {
            throw new Error('IBM Cloud Account extension must be installed');
        } else if ( !cloudAccountExtension.isActive ) {
            await cloudAccountExtension.activate();
        }
        const cloudAccount: CloudAccountApi = cloudAccountExtension.exports;

        const isLoggedIn: boolean = await cloudAccount.loggedIn();
        let result: boolean;
        if ( !isLoggedIn ) {
            if (userInteraction) {
                // If not logged in, ask the user to login, and then to select the account.
                result = await vscode.commands.executeCommand('ibmcloud-account.login');
                if (!result) {
                    return;
                }
            } else {
                // Just return if we are not supposed request user interaction.
                return;
            }
        } else {
            const hasAccount: boolean = await cloudAccount.accountSelected();
            if ( !hasAccount ) {
                if (userInteraction) {
                    // If not logged in, this will first ask the user to login, and then to select the account.
                    result = await vscode.commands.executeCommand('ibmcloud-account.selectAccount');
                    if (!result) {
                        return;
                    }
                } else {
                    // Just return if we are not supposed request user interaction.
                    return;
                }
            }
        }

        const accessToken: string = await cloudAccount.getAccessToken();

        return accessToken;
    }

}
