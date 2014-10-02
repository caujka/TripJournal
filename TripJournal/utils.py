import json
import os


def client_key_and_secret(secrets_path, client):
    secrets = json.load(open(
        os.path.join(secrets_path, '%s_client_secrets.json' % client)
    ))
    return secrets[u'web'][u'client_id'], secrets[u'web'][u'client_secret']
