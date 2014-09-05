#!/usr/bin/env python
"""
This module is for resizing pictures.
To use it type:
./resize_img.py path_to_pictures_directory images...
for example:
./resize_img.py /home/user/Pictures 1.jpg 2.jpg
resized pictures will by saved to the same directory where original
picture was with width added to name. In example above:
/home/user/Pictures/1_400.jpg and so on.
"""
from PIL import Image
import sys
import os.path


def resize(original_pic, width):
    """
    original_pic - name of picture file to resize.
    width - desirable width of new picture.
    The function returns resized picture.
    """
    img = Image.open(original_pic)
    original_width = img.size[0]
    if original_width > width:
        height = int(img.size[1] * (width / float(original_width)))
        img = img.resize((width, height), Image.ANTIALIAS)
        return img
    else:
        print ('The width of the original image was smaller or equal to %i.'
               % width)


def save_pic(img, original_pic_name, suffix, path):
    """
    Saves resized picture to the path
    with the suffix added to the name.
    """
    img_name_parts = original_pic_name.split('.')
    new_name = '%s_%i.%s' % (img_name_parts[0], suffix, img_name_parts[1])
    img.save(os.path.join(path, new_name))


if __name__ == '__main__':
    widthes = [400, 700, 900, 1500]
    img_dir = sys.argv[1]
    for image in sys.argv[2:]:
        for width in widthes:
            new_pic = resize(os.path.join(img_dir, image), width)
            if new_pic:
                save_pic(new_pic, image, width, img_dir)
