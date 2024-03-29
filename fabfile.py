# Copyright (c) 2010, Alberto Pose. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without 
# modification, are permitted provided that the following conditions are met:
#
#   * Redistributions of source code must retain the above copyright notice, 
#   this list of conditions and the following disclaimer.
#   * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation 
#   and/or other materials provided with the distribution.
#   * Neither the name of Streema nor the names of its contributors 
#   may be used to endorse or promote products derived from this software 
#   without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


from fabric.operations import prompt
from fabric.api import local
import os
import json

def _walk_this_way(cmd):
    for root, dirs, files in os.walk(os.path.split(__file__)[0]):
        for d in dirs:
            if d.startswith('.svn'):
                dirs.remove(d)
            if d == 'ext':
                # sorry, I'm not gonna check 3rd parties code
                dirs.remove(d)

        for f in files:
            if f.endswith('.js'):
                filename = os.path.join(root, f)
                filename = filename.replace("\"", "\\\"").replace("\'", "\\\'")
                local(cmd % filename, capture=False)
    

def jslint():
    """ Check the code using jslint"""
    _walk_this_way('js jslint \"%s\"')

def check():
    """ Compile the code using Google Closure Compiler"""
    _walk_this_way('java -jar compiler.jar  --formatting PRETTY_PRINT --jscomp_dev_mode EVERY_PASS --summary_detail_level 3 --js \"%s\" > /dev/null ')

def _increase_version():
    """Adds a number to the current version number"""
    f = open('manifest.json','r')
    manifest = json.load(f)
    f.close()
    
    f = open('manifest.json','w+')
    manifest_chunks = manifest[u'version'].split('.')
    manifest[u'version'] = '.'.join(manifest_chunks[:-1] + 
        [str(int(manifest_chunks[-1])+1)] )
    version = manifest[u'version']
    f.seek(0)
    f.truncate(0)
    json.dump(manifest, f, indent=2)
    f.close()
    return version

def zip(version=None):
    """ Creates a zipfile to upload to the chrome extension gallery """ 
    local('svn export . streema-prod')
    if version is not None:
        local('zip -r streema-%s.zip streema-prod' % version)
    else:
        local('zip -r streema.zip streema-prod')
    local('rm -rf streema-prod')

def release():
    """Makes a new zip release"""
    version = _increase_version()
    msg = prompt('Please enter a release message:')
    local('svn ci -m "%s"' % msg.replace('"', '\\"'), capture=False)
    local('svn copy https://streema-chrome.googlecode.com/svn/trunk https://streema-chrome.googlecode.com/svn/tags/release-%(version)s -m "Tagging release %(version)s"' % {'version': version}, capture=False)
    zip(version)

    
