// TODO: add settings

import { Platform } from '../../Interface'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const getSettings = async () => {
    // When env flag enabled, force Enterprise platform for UI
    if (process.env.DISABLE_EE_CHECKS === 'true') {
        return { PLATFORM_TYPE: Platform.ENTERPRISE }
    }

    try {
        const appServer = getRunningExpressApp()
        const platformType = appServer.identityManager.getPlatformType()
        const isLicenseValid = appServer.identityManager.isLicenseValid()

        switch (platformType) {
            case Platform.ENTERPRISE: {
                if (!isLicenseValid) return {}
                return { PLATFORM_TYPE: Platform.ENTERPRISE }
            }
            case Platform.CLOUD: {
                return { PLATFORM_TYPE: Platform.CLOUD }
            }
            default: {
                return { PLATFORM_TYPE: Platform.OPEN_SOURCE }
            }
        }
    } catch (error) {
        return {}
    }
}

export default {
    getSettings
}
