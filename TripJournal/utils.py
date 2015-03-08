import json
import os

import TripJournal.local_settings as local_settings


social_status = {
    'vk': True,
    'facebook': True,
    'google': True,
    'email': False,
}

if (local_settings.emailHost and local_settings.emailHostUser and local_settings.emailHostPassword):
    social_status['email'] = True   

def client_key_and_secret(secrets_path, client):
    try:
        secrets = json.load(open(
            os.path.join(secrets_path, '{client}_client_secrets.json'.format(client=client))
        ))
        return secrets[u'web'][u'client_id'], secrets[u'web'][u'client_secret']
    except:
        print "{client} is not supported".format(client=client)
        social_status[client] = False
        return "", ""
