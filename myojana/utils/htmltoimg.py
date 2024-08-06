import imgkit


def create_image(ben_id):
    # Define your HTML content
    html_content = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test HTML</title>
    </head>
    <body>
        <h1>Hello, World!</h1>
        <p>This is a test HTML to image conversion.</p>
    </body>
    </html>
    '''

    # Convert HTML to image
    return imgkit.from_string(html_content, 'output_image.png')

