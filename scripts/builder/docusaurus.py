import os
import tempfile


def generate_config(original_config_path, version=None):
    with open(original_config_path) as f:
        content = f.readlines()
        return update_config(content, version=version)


def update_config(content_lines, version=None):
    result = []
    prev_line = ''
    for line in content_lines:
        new_line = update_config_line(line, prev_line, version=version)
        prev_line = line
        result.append(new_line)
    return ''.join(result)


def update_config_line(line, prev_line, version=None):
    if line.startswith("  baseUrl: '/',"):
        if version:
            return f"  baseUrl: '/{version}/',"
    return line


class Docusaurus(object):

    def __init__(self, content_dir):
        self._host = ''
        self._content_dir = content_dir
        self._dest_dir = 'build'
        self._current_branch = ''
        self._current_version = ''
        self._base_url_prefix = ''
        self._versions = []
        self._title = 'Cloudpods'

    def set_host(self, host):
        self._host = host
        return self

    def get_host(self):
        return self._host

    def get_title(self):
        return self._title

    def set_title(self, title):
        self._title = title
        return self

    def set_dest_dir(self, dest):
        self._dest_dir = dest
        return self

    def get_dest_dir(self):
        return self._dest_dir

    def set_current_branch(self, cur_br):
        self._current_branch = cur_br
        return self

    def get_current_branch(self):
        return self._current_branch

    def set_current_version(self, ver):
        self._current_version = ver
        return self

    def get_current_version(self):
        return self._current_version

    def set_versions(self, versions):
        self._versions = versions
        return self

    def set_base_url_prefix(self, pre):
        self._base_url_prefix = pre
        return self

    def get_base_url_prefix(self):
        return self._base_url_prefix

    def generate_config(self, version=None):
        config_content = generate_config('./docusaurus.config.js', version=version)
        fp = tempfile.NamedTemporaryFile(dir=os.curdir, delete=False, prefix='__cloudpods-website', suffix='.js')
        fp.write(config_content.encode(encoding='utf-8'))
        return fp.name

    def execute(self):
        from utils import run_process

        ver_dir = ''
        ver_title = self.get_title()
        if self._versions:
            if not self.get_current_version():
                raise Exception("Current version not set when versions are %s" % self._versions)
            if self.get_current_version() != self._versions[0]:
                ver_dir = 'v' + self.get_current_version()
                ver_title = ver_title + ' ' + self.get_current_version()
        dest = self.get_dest_dir()
        base_url = self.get_host()
        base_url = os.path.join(base_url, self.get_base_url_prefix())
        version = None
        if not base_url.endswith("/"):
            base_url += "/"
        if ver_dir:
            dest = os.path.join(dest, ver_dir)
            base_url = base_url + '/' + ver_dir + '/'
            version = ver_dir
        temp_config_file = self.generate_config(version=version)
        run_process(['rm', '-rf', dest])
        cmd = ['yarn', 'docusaurus',
               'build',
               '--config', temp_config_file,
               '--out-dir', dest]
        run_process(cmd)


if __name__ == '__main__':
    print(generate_config('../../docusaurus.config.js', version="v3.10"))
