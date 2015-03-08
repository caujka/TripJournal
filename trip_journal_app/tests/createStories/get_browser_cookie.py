import os
import pwd
import sqlite3
import requests

from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2

def decryptChromeCookies(dictCook):
    decrCookies = {}
    # Function to get rid of padding.
    # This function for Python3???
    """def clean(str): 
        return str[:str[-1]].decode('utf8')"""

    for keyInDict in dictCook:
        # replace with your encrypted_value from sqlite3
        encrypted_value = dictCook[keyInDict]

        # Trim off the 'v10' that Chrome/ium prepends
        encrypted_value = encrypted_value[3:]

        # Default values used by both Chrome and Chromium in OSX and Linux
        salt = b'saltysalt'
        iv = b' ' * 16
        length = 16

        # On Mac, replace MY_PASS with your password from Keychain
        # On Linux, replace MY_PASS with 'peanuts'
        my_pass = 'peanuts'
        my_pass = my_pass.encode('utf8')

        # 1003 on Mac, 1 on Linux
        iterations = 1

        key = PBKDF2(my_pass, salt, length, iterations)
        cipher = AES.new(key, AES.MODE_CBC, IV=iv)

        decrypted = cipher.decrypt(encrypted_value)

        #decrypted = clean(decrypted)
        decrypted = decrypted[:32]

        decrCookies[keyInDict] = decrypted
    return decrCookies

def checkCookies(cooks, checkingAddress):
    r = requests.get(checkingAddress, cookies=cooks)
    return r.status_code

def extractCookiesFromDB(dbFile, site, value, table, domain):
    activeCookies = {}
    connection = sqlite3.connect(dbFile)
    querier = connection.cursor()
    querier.execute("SELECT " + value + ",name FROM " + table + " WHERE (" + domain + "='127.0.0.1') and (name='sessionid' or name='csrftoken')")
    for row in querier:
        value = str(row[0])
        name = str(row[1])
        activeCookies[name] = value
    connection.close()
    if "chrome" in dbFile:
        activeCookies = decryptChromeCookies(activeCookies)
    return activeCookies

def getCookies(addressOfCookie, site, checkingAddress):
    cookieDB = os.path.join(pwd.getpwuid(1000).pw_dir, addressOfCookie)
    status = 0

    if os.path.isfile(cookieDB):
        if "chrome" in addressOfCookie:
            activeCookies  = extractCookiesFromDB(cookieDB, site, "encrypted_value", "Cookies", "host_key")
        elif "mozilla" in addressOfCookie:
            activeCookies  = extractCookiesFromDB(cookieDB, site, "value", "moz_cookies", "baseDomain")

        try:
            status = checkCookies(activeCookies, checkingAddress)
        except:
            print "Sorry. Problems with connection."

        if status == 200:
            return activeCookies
        else:
            print "Please login to project in your browser."
    else:
        print "Problems with cookies db. Maybe you give wrong address."


#cookieDB id = 1000?
