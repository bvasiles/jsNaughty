#!/usr/bin/env python
# encoding: utf-8
"""
Client library for REST APIs

Created by Christian Klein on 2010-07-21.
Copyright (c) 2010 HUDORA. All rights reserved.
"""

from huTools.http import fetch
import os
import urllib
import urlparse
import simplejson as json


def build_url(base, *args):
    """
    Create URLs for a REST API

    >>> build_url('orders_', 1)
    'orders/1/'
    >>> build_url('cool_mc_cool_', 1, 2)
    'cool/1/mc/2/cool/'
    >>> build_url('cool_mc_cool_', 1, 2, 3)
    'cool/1/mc/2/cool/3/'
    """

    tmp = []
    args = list(args)
    components = base.split('_')

    while components:
        tmp.append(components.pop(0))
        if args:
            tmp.append(str(args.pop(0)))
    return os.path.join(*tmp)  # pylint: disable=W0142


class ClientException(Exception):
    """Basisklasse für Exceptions"""
    pass


class ClientNotFoundException(ClientException):
    """ HTTP Status 404 - das Dokument wurde nicht gefunden """
    pass


class ClientForbiddenException(ClientException):
    """ HTTP Status 403 - kein Zugriff erlaubt """
    pass


class ClientUnauthorizedExecption(ClientException):
    """ HTTP Status 401 - Authentifizierung via OAuth/ BasicAuth fehlt """
    pass


class ClientServerErrorExecption(ClientException):
    """ HTTP Status 500 - wenn ein allgemeiner Serverfehler aufgetreten ist """
    pass


class Client(object):
    """
    Client for RESTful API

    All data is encoded as JSON.
    """

    def __init__(self, username, password, endpoint=None):
        self.username = username
        self.password = password
        self.endpoint = endpoint

    def __getattr__(self, method):
        def handler(*args, **kwargs):
            """doc for handler"""
            return self(method, *args, **kwargs)
        return handler

    def __call__(self, fnc, *args, **kwargs):
        """Do a remote procedure call via HTTP"""

        headers = {'content-type': 'application/json'}
        path = os.path.join(self.endpoint, build_url(fnc, *args), '')
        if 'params' in kwargs:
            path = "%s?%s" % (path, urllib.urlencode(kwargs.pop('params')))

        if kwargs:
            content = json.dumps(kwargs)
            method = 'POST'
        else:
            content = None
            method = 'GET'

        url = urlparse.urljoin(self.endpoint, path)
        credentials = '%s:%s' % (self.username, self.password)
        status, headers, content = fetch(url, method=method, content=content, headers=headers,
                                         credentials=credentials)
        if status == 201:
            return {'status': 201, 'success': 'created'}
        if status == 401:
            raise ClientUnauthorizedExecption()
        elif status == 403:
            raise ClientForbiddenException()
        elif status == 404:
            raise ClientNotFoundException()
        elif status == 500:
            raise ClientServerErrorExecption()

        try:
            return json.loads(content)
        except Exception:
            return {'status': status,
                    'error': 'unparseable response',
                    'data': content}

    def close(self):
        """Close API Client."""
        pass


if __name__ == "__main__":
    import doctest
    doctest.testmod()
