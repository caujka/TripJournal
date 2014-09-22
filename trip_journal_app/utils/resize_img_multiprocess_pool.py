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
from multiprocessing import Pool
from TripJournal.settings import IMAGE_SIZES


def resize(original_pic, size):
    """
    original_pic - name of picture file to resize.
    width - desirable width of new picture.
    The function returns resized picture.
    """
    img = Image.open(original_pic)
    original_size = max(img.size)
    change_percent = size / float(original_size)
    if change_percent < 1:
        width, height = [int(s * change_percent) for s in img.size]
        img = img.resize((width, height), Image.ANTIALIAS)
        return img
    elif change_percent == 1:
        return img
    else:
        print ('The width of the original image was smaller or equal to %i.'
               % width)


def save_pic(img, original_pic_name, suffix, path, new_prefix=''):
    """
    Saves resized picture to the path with the suffix added to the name.
    If new_prefix is provided renames file to new_prefix_suffix.
    """
    img_name_parts = original_pic_name.split('.')
    new_name = '%s_%i.%s' % (
        (new_prefix or img_name_parts[0]), suffix, img_name_parts[1]
    )
    img.save(os.path.join(path, new_name))
    return new_name


def save_resized_pic(args):
    pic_name, pic_dir, size, new_prefix, new_dir = args
    new_dir = new_dir or pic_dir
    img = resize(os.path.join(pic_dir, pic_name), size)
    if img:
        new_name = save_pic(img, pic_name, size, new_dir, new_prefix)
        return new_name, size


def resize_and_save_pics(pic_path, new_name, sizes, save_path):
    orig_img = Image.open(pic_path)
    orig_size = max(orig_img.size)
    pool = Pool(processes=4)
    pic_dir, pic_name = os.path.split(pic_path)
    sizes = [s for s in sizes if s < orig_size] + [orig_size]
    imgs_and_sizes = [
        (pic_name, pic_dir, size, new_name, save_path) for size in sizes
    ]
    return pool.map(save_resized_pic, imgs_and_sizes)


if __name__ == '__main__':
    NEW_SIZES = IMAGE_SIZES
    img_dir = sys.argv[1]
    pool = Pool(processes=4)
    imgs_and_sizes = [
        (pic_name, img_dir, size, None, None) for pic_name in sys.argv[2:]
        for size in NEW_SIZES
    ]
    pool.map(save_resized_pic, imgs_and_sizes)

