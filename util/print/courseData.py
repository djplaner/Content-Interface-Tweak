#
# Define data for course pages to be converted to PDF

# define where to write reports for courses

global COURSE_REPORT_FOLDER

COURSE_REPORT_FOLDER = {
  'CWR110_2211': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Administration\\',
  'CWR111_2211': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP4\\CWR111\\Administration\\',
  'COM12_2211': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\COM12\\Administration\\',
}

# define what files to check/convert for each course
global COURSES

COURSES = {
        'TEST_3211':
        [
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5997939_1&course_id=_73051_1&content_id=_5997943_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\OneDrive - Griffith University\\Software Development\\Documentation\\Content Interface docs - v2\\Customising - Provide PDF\\links.pdf'
            },
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5998002_1&course_id=_73051_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\OneDrive - Griffith University\\Software Development\\Documentation\\Content Interface docs - v2\\Customising - Provide PDF\\cards.pdf'
            }
        ],
        'COM22_2215_OT':
        [
            {
              "title": "Week 1: What is 'New Media'",
            "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240977_1&course_id=_90761_1"
            },
            {
              "title": "Week 2: History of 'New Media'", 
              "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240978_1&course_id=_90761_1"
            },
            {
              "title": "Week 3: Digital Divide", 
              "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240979_1&course_id=_90761_1"
              }, 
              {
                "title": "Week 4: Fragmentation and Convergence", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240980_1&course_id=_90761_1"}, 
                {"title": "Week 5: Study Skills", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240981_1&course_id=_90761_1"}, 
                {"title": "Week 6: The political economy of social media", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240982_1&course_id=_90761_1"}, 
                {"title": "Week 7: The formation of identity through cyberculture and new media", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240983_1&course_id=_90761_1"}, 
                {"title": "Week 8: Ethical and moral issues facing online communities", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240984_1&course_id=_90761_1"}, 
                {"title": "Week 9: Governance of the Internet", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240985_1&course_id=_90761_1"}, 
                {"title": "Week 10: Surveillance", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240986_1&course_id=_90761_1"}, 
                {"title": "Week 11: Transforming textuality", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240987_1&course_id=_90761_1"}, 
                {"title": "Week 12: Social movements and new media", "URL": "/webapps/blackboard/content/listContentEditable.jsp?content_id=_6240988_1&course_id=_90761_1"}
        ],
        'CWR110_2211':
        [
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977540_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\01.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977544_1',
                'css': './gu_study.css',
                'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\02.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977548_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\03.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977553_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\04.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977558_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\05.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977563_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\06.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977568_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\07.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977573_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\08.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977578_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\09.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977583_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\10.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977588_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\11.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977593_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\12.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977598_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\13.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977605_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\14.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977609_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\15.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977614_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\16.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977619_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\17.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContent.jsp?course_id=_90727_1&content_id=_5977624_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP1\\CWR110\\Study Guide PDFs\\CWR110_2211\\18.pdf'}
        ],
        'CWR111_2211':
        [{'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977955_1&course_id=_90774_1',
          'css': './gu_study.css',
          'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
          'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\01.pdf'},
         {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977963_1&course_id=_90774_1',
          'css': './gu_study.css',
                 'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
          'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\02.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977968_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\03.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977973_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\04.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977978_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\05.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977983_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\06.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977988_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\07.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977994_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\08.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977999_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\09.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978004_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\10.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978009_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\11.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978014_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\12.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978019_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\13.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978024_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\14.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5978028_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\15.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977918_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\16.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977926_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\17.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977934_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\18.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977940_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\19.pdf'},
            {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5977948_1&course_id=_90774_1',
             'css': './gu_study.css',
             'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
             'Guides & L@G\\SP4\\CWR111\\Study Guide PDFs\\CWR111_2211\\20.pdf'}],
    'COM12_2211':
    [
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002735_1&course_id=_90697_1',
      'css': './gu_study.css',
      'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
      'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\01.pdf'},
     {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002749_1&course_id=_90697_1',
        'css': './gu_study.css',
        'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
      'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\02.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002765_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\03.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002777_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\04.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002789_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\05.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002803_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\06.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002814_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\07.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002826_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\08.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002836_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\09.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002846_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\10.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002854_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\11.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002866_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\12.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002874_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\13.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002882_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\14.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002888_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\15.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002898_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\16.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002904_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\17.pdf'},
        {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_6002910_1&course_id=_90697_1',
         'css': './gu_study.css',
         'name': 'C:\\Users\\s2986288\\Griffith University\\HLSSacademic - OUA\\Study '
         'Guides & L@G\\SP1\\COM12\\Study Guide PDFs\\COM12_2211\\18.pdf'}],
    '1611QCM_3211' :
    [{'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5980859_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963375_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963376_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963377_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963378_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963380_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963381_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963384_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963386_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963388_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963389_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963390_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
# {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5963392_1&course_id=_89822_1',
#  'css': './gu_study.css',
#  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5982686_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5982699_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''},
 {'URL': 'https://bblearn-blaed.griffith.edu.au/webapps/blackboard/content/listContentEditable.jsp?content_id=_5982705_1&course_id=_89822_1',
  'css': './gu_study.css',
  'name': ''}]
}
