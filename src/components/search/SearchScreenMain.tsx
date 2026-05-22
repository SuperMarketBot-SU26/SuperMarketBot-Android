import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, FileText, Map, Plus, ShoppingBag, Star, User, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const FILTERS = ['Tất cả sản phẩm'];

const SEARCH_RESULTS = [
  {
    id: '1',
    title: 'Cá Basa Phi Lê CP 500g',
    image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=400&auto=format&fit=crop', // Placeholder for fish
    tags: [{ text: 'ĐỀ XUẤT', type: 'suggest' }, { text: 'GIẢM GIÁ', type: 'discount' }],
    rating: 4.8,
    reviews: 130,
    price: '65.000đ'
  },
  {
    id: '2',
    title: 'Cá Basa Hữu Cơ Cắt Khúc',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop',
    tags: [{ text: 'HỮU CƠ', type: 'organic' }],
    rating: 4.5,
    reviews: 85,
    price: '82.000đ'
  },
  {
    id: '3',
    title: 'Cá Basa Nguyên Con Sạch',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTEhMWFRUVGBcXFRYYFhYVFhcYFxUXFhgVGBUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi0lHx0tLSstLS0tKy0tLS0tKy0tLS0tLS0tLTAtMi0zLS0tLS0tLS0tLTgtLS0tLS03LTctLf/AABEIAKgBLAMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAFAAIDBAYBBwj/xABCEAABAwIFAgMGAwcDAgUFAAABAAIRAyEEBRIxQVFhBiJxEzKBkaGxwdHwBxQjQlKS4WJy8YKyFTOTosIWQ1Njg//EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACYRAAICAQUAAQMFAAAAAAAAAAABAhEDEiExQVEEEzJhFCJCcfD/2gAMAwEAAhEDEQA/AI8/wrWMplo8xFzwet+qq4OoyAHOcJ6GIVjNqjH0mjU4Ecd+oQcvAABJttbieVzSq7Rwv8F+tTM2JPyKjFMzJbZWyxhhzTeOirOdFpIt8CiSp2S0TUiAIE7WTg+BbfuqdB99+6TiXkEWLT8IWalTYOy2ypNxYneeFYoMaabmvAc4yZ6ILicfHlFybKzSxA0gkRaFUZ0CdElOu2lI62m6r1B5PKd5m23ouUC0u8wseJ3/ACU1WmG+il8Dsr0DJ2nSpy0OJ6/QJtN1rbcnqrFLCEs1WDR3uVCTbEVa72sAJIJHOwQXHYlxu0anb+7aOsoni6Q0mR6gCTCiZV1tIa3SItPRUlRcVW5WwxDjdrgIFzyeqtPLdPLiDsonkkQFFVdBBmxtCbduwk7O06pBnoU84lxPlEiZLlHNoi3U8JNxcANYwu5JFh05QJItYmk6qBptHTZcpUWtaRUfGr5KP/xAsBlpbPMgkcWVDWH7EuEm/CKbDcKirS90Q4jYEFStbMBrZnaOJQzDu88j+UfDcW7/AOVfoYtzT5Xhp3LiQ3a8b+uyNPQqvYP4J3sWFlWjIIOkls39eB81ynSaxodJG8w6NQ4gC44uUNxniM1NMvYIA3cO4Jibfr1Q2vjqDYHtX1Zu5tMfPzuAHwuFo05fai6bDn7zqI0uc4xAi5PBAt34RDC5fiWsLqbXNbF4IEiJkwVjcVn8EGhQaxo5q/x3ExudVhvtcIVXr1K5OqoXzu0Q1vpoYA36Ko/HfbLWP1m9ObZZQkYiXv50P9q7af5DHzNlUHi/DOM0cE6mw+69+INJ5PZrA4D5oX4f8IOq7AA9CJP0Rd/hQUyW1mh7pboaJJBBmRaJ2ibdRdaxxpKmbRgbXwfnX7wXMeHSBIDodsYcNYa2YltiPitBRwVNmrQwN1GTAgE9YWSyDLXUnMq1CdQAAk3iIaT3I1z/AMLYVq7QAXEAXJJOwAkn4K4cbl5IxT2HQnGn0URxLPaCnMvJjSLkW1SegiL9x1V9rFakujMokEKxScVO+lIVcsLUxkye1RUngqwAkAgnALgXQkM8OxTJF+dvgh1dzoiJ6H0V6hfYzF000RMOuOPivOT6ONFvIcTqBaSAehV11O+kgLOYcezqOja027rSPwxaZk6SAWnhbp2v6HRXbhm6jbsVGMIHeUHTM3CfWeZ4ldNSaYI2bxz3WaS1MOgRVw5BgXgwT6cqti8RB0g/5Vh9YvnTsOeiHaQTcz3UvkVeljCO+PdE6lUEQb7QAqGCoWnpsFPTrQSBc8Kd7oTTJ2EjiyixWLcAAB15gKvmuKq6g2k3/cTsq4wtR9qh72VJVyNR9JBha1Q3a0Dglx+ylr4YUw2XhxI42VnC5cIP8SPr91VxVFpbE7fzde61dKPBTZFUZG1ydo4VUUgTJ/46/FSVcSGiS4A8Dcx1A3VVuMIuG/F5+wFz9FKhKXCBRbLtLD6jv5fuf0E/EANENgdZ2HclAMTmjwbOv/paB8pkqm1j6hlxJJ6n8VosD7K0BipmDGuiPamLaYIPqdhumtfUduQybwwCfiSu4TLjHQfX/KI0cLHEd1tHFFFKKRQOFG7i5x6SSpWYVvDAO8fmr7WgG1/srOHa0EF8mdgI+yuiwPUwAO4sm08AD5WNk9AJKNVDTBMMvyXSfpsFJSxLneRnxiwWbyJM6I/HnJWUMH4fqAaqnsmj+lwFQ+u4A+BK1Xg/we2uPbOpgNk6XAFuxjVGo2lBMNgC+q1r9bgXCYJJInbew4XsXhzy0mtLdIaAGtkWAFhbsrU74JnhUOQZhMO3CkA03Bu2uNQ+bdvoiAwrXvNWxtY79fzRdwBaQIAPG49YWdzHDGhqxRqHTSYTp2abbRyXWbvype7CNJGc8XZoW4inSY0O9lNSqJDQXQC1sk/yiHc/yoNhhiKs69fnlziNJIZOowwuDmgm5dIEQLhB8RinV6uuo1ocZNUsaWl5Ny7V5uRzMdArzsQ5rDSpt0NMaps91jAcdIJBmY/5WEpKznlJcsP08c4VHNw7NdRzSw1SWiq95gvqS517CABYXRrC41tEmC+viHgDTpA9nsNLtJIbsBvwFmcHh6baZY3FuptO/wDBezV1nS8z6T6gIngcspsiKlCpPJqVKdSN9536ypt9CUvDeYd7tI1xq5jb6qUuB3QHJMM6mYGrSRMOOsD/AGPFo7GEYAXVB2jRDH0eWqSlV4KcxdfQBEjdWMkXQoWuIMEKZqQzxH2YdqeIY4OgDi6hdScCdQv0P3C0GMyqm4EsNwJgfPZAHOmCXEwCBPC5MkKOWqK5bPtIvI+aMYAufQabkAQfh2QwMHs3u5gfAyi+VVtGFaepIRh35CqKUiw7qzhyLxtsVC6mJ7fiUsG2TpHUqFtNAvt2B+PAa0hg3lCqQABsrFSoS4g8EwPioWvc63dSxPYtUCem6e2oxhg3ceApKTGj3r9FLSoNAgCPXf8ARUkkcGptqb8lYp4HeS4giD0srWHwp6WtaR6+q7mLCxhdDh080meLbLeGN1bKSYLxWLY0FrBNrnbSJQPHYp7vcdDebafkTJ+yIOosdLnmIgkCI23uQDvubD5ofiarHGKLT3e7b4Dn7eq0hFPc3jGKB5hlyN+Tz8Dv8VA7W++w+vwCIUMGSf6j1P4Izl+VcuBB54ldCTG5eATAZU48W5Jv8yjlHLAIsLfJG6GCPSwF+sfirX7t/Tv90wUQO7CwL/JRPYY6D6I2/CaRffgJlPBayGtF0gBmDwL3uAY3UVs8J4TZTANXU55vaABJ29UVyDJW0xrcIcCdI6cSVoKNHVchVpXZKk+jLf8A0mxxBaIHfzH8lDV8InV5YA5PPyW7aQBZQVVk8cWbxzTj2AsmySnQ83vP6nj0RVrRKTlAyrJhWkktjNycnbLWnTz6LAeOfEzKpOEY6WNINR8wNbSCGSGmQDcxyBtCM+PM4NBlOm2p7N9XV5tBeQ1sAxFmklwEnvHUYrLcA1ziG4sBxF3aXkxtao4wNzeVlLwJSH4FmF1XpVHN3kOkk9mxZszculH8GzDQB+61BP8AU3XIjcEOP/tunYXL67GNFGtT0/1aSS7uSSZRGkyuN3sd/wBLmfXUY+SIw/1GaQ+jleHNxSaQZ4LTz6EIxgsGxkaC7T/QTqH/ALpI+BhUmPKp4/xXg8NeriGAj+Rp1v8A7GSfotNEfC0aikwD3QB6WTiV5fmn7YaQOnDYV9RxsDUcKYPo1gcT8YSyfx9mFeoGeww7OXEtqWA//pc7BFpFpN8HqIU7DZC8pzEVqYeImS1wBkBzSQR6Wn0KvayjkGmnTH1U5jlDJO6lYEUI8jynGFtSXGx8p9E/xDlQYdTfdNxflD6lKD5gRcp1TF6hocSRH2XFqpaWcvQMxFVwBYediPxTKWIe0NaTIaZjhS4l23l8ux7LtdjTGnYgKFYF19YPdABE3UOYU6lJzXA2dz0U2Dw0w6fLJCPY3Ch1HTGwkfBXCDk2/EbRTWO/WYOuZd1J94q9TYIlvomuwLpiLcn9cKbEU6miGAWsN1lyZNNKvTtCkRc3PXgDoFdweEngmOdTQPzlVCTAEukbmQTfgDYcdbLrXaWuc6pDWzdztht5QTc8crfHGN+gkg03DNF3NAAv7xWbzrO26vZsBcGmdDTueNbr6Rz17cgXj85fW/h0i5tMCB/K53oB7o+Z9FFgMte4adOkfGV1adWxtB6V+Rwa6q7zEGI8oENH5n1+iJYXKif8IvluUhrQi1LDgbCPuqpRCKsH4bLGtA5RClhW/wCFbo0+w+U2Vyi3+kW6ouzRJIgoYYkxEAc9R6q3+6tsBcqyxWMPRcYIEf4TSJbAVbCHUeTNvkEXweXNbcy11iCpCwNPm+atfvAi2/cqlsQ9yyytHvH81KzEd0EYHuNgUzE4+lQP8Ws0dtQn5IBGhOIHCdUqQJd8lkcZ4+wdNstcTHIaSSexNj8Fi83/AGmVnmMPSA/11CXfJgj6lSUj1WpWLtlHTeARqgetvuvCcX4jxtX38RV/2td7MfJkKqMZVm7ifUklKxnpviIOxOK1OdTFNo009UGw3LpINzJ54VrBUsEwEVqmHcfUbRE6XOMH0XlT8dU5c7+4gfJUjVmSTA7qaSJpHq+YeIsroiWed3HsQQbf65HzWezL9o9dwihTbSH9Tv4j/Xhs/ArF1aBe0OpkGOJg7qbCZFiKvuMcR2v9BdOh7CzHN8RW/wDOxFV46Fxaz+xsN+iHU6f9I+QRjDZDUBgsdvGxH3Xp3gzwbTDGvcJJvf7R0Q0CZ5nk+VP1tJBjk9Bz8VrMky4ioKVH3HgOJk6mkAAtI7aXna8t7x6Jisgpgwxgv2+/ZJmXswzLD+I/nkDkrO7VG6enc74WwzaLSwbkySbk8CVpQEGyihyUZC0iqVETk5StnQnBNCeECMXisrpVPebfrsVSPhenu1xB73WgfTSDkSxxlyjLSjzzOslqU5MWncbIMymbwdrEfYr1yowOEOEhYjPckFN0t2O3pNx6Lky4tG64GserZHcpwf8ABaDblE6rgAZ2hSUaflHop6eX+0sRIBnsuyMEo7c0EXwnwgBh8sqVJPuNJ3NyRwQOl0nZTcjVMW2PXax22WybgdPErM+N87Zg2Q2mPavEtJFheJ/1Htxys1ggluJq9wXjAzDg1az7CdMe8TwADKwOY5hVxdSSIaPcZNhfc/1O7qKrUrYp41Oc88SevPT5La+HvDgaAXb94hXGKXAkvAbkuQkkEiO3H3Wtw2XNbaBKKUMFG3H6lW24QqrLS9BtGkf1CsMwp5CJtw0cKwzBuJ2SoHIGU8P2+is0sKTsCi+Hy6IlW9DWqidwbhsu6q5VDKTC50AASSbADuTsFHjcybTaXGGtG5NgvIv2l+Km4sNo0WuLWOLi+dM2iADYDub2sAixo0Oe+OsEwkNcax6UgC3+8kN+RKzOY/tIxDhFGjTpDguJqv8A/i0H4FYujhyrtOjt+ASsKJ8RnmPre/iKrQeNZpD00U4+oVfCUWtMnzO72Hx5Pqr9PLy706q1QwAtA/JMVlF2p3J7Rb67powvb9eq0LcvJEx+C4/ADeZjpt+rJUFgOngZNlI7LzwJP1R2nQjYBS1MKG+9F+JTSFZlKmXumXAntt6Ko/CAnSGlx4aASfkF6DWo+Vv8KZ/qktHEkDj1Urq+iwgAf0tA+yxnljE6MeCUlZicu8K4iofdNJo5cNJ+DdyfVEqnh51MEguDhs52I0OJ7NYx0f3I0/FF+2o9yT9hZWfDeWtq1w9w16btA4INyfSFEc6Z0fo2lbDvhDIqxY19aq9+sAw8ucWg7SKgk/MLY/uHs2g3ty1sj4tF1aw7bAkX6q+2IVN2YccATC46mQSHh0TZsSYnjj4oRqdVqSfSOgHC0WNZTpNdUIv/ANx4CFZSwETzyqiiZMIUKekABTBNCcrJHBPCYE4JDBD2wCVVaFexDbFVmtVEs60ITmtAOdDhIsilWuymPO9rP9zg37lAsx8V4CmdVTENMbBgdUJ/sBRyAYwWBAEv+XRXSWtEiABuf1svNc7/AGqCIw1Ano+tYeopsJJ+JCwOZ59jcW6K1Z7mzZghrB/0Nt8TJ7pWB6j4t/aDQoAsoEV6/AaZps7veLfAb9l5iWYjGVTUquL3u3J4HQDgdleyfw7MF9h9St1k2RgCw0hA1FspeHfDwYBIvzv9VsMHlyt4HL2tCuuxDGnTN0BsuCKng+ArdHCBdpYgRaE52LaOUEDm0WjhSakPrZm1qzOe+NadCZN+GiC4/DhOgs2VevA3/QWdznxVh6A/iVAHf0jzOP8A0j8V5dnPjnE17MPs2np73xdx8EDZhy4ybneTefncovwRqfE/jh+JGilS0snd13fACzfqsmKZcbySPl8P8Iph8uc5GMDlcCSPmivQAGFy5ziOiM0Ms2MavujeHwItaI3RanhxA0j0QOvQJh8sJvt+PwRCllwaR5Znr19EYwmBvPCI08NPEwmIzpy8u3kfhCa/L27cxP3WgxVPSL9PoqLhqnSJMHZMRmqmGIMC9j8O6I5ZldtT7v3AcNQAPSefVF6GXQ9pMydvyWlwmCaLkQfxQxozlDLyZOgmf5nEz6AcKenkFN5vE9Y/GVp/ZAD1UeHoAH1WThFm0ZyXZnMJ4OAdYgg9VpMBktOi2GASdzF/TsESYU8hZrHFO0aTzTmqbIW04VXHY1tMS4ns3kq5WqBrS5xgASSsfiKjq1Qu67DoOArSMxuLxD6z5Ow2bwP890ZwFHS1MwmDDR3VwBXRJIE4JgTwgBwTgmhdakM+fn+I8YTH71V/9ZxHzhVK+OxJ9+vVcDwajyPur+OoVmOirDI/pbM+l1WfTJt/EPd2ljfpcpakPSwSXCdv1KutwJdTBG+6ZXwl/LLvT3f7ir2DzKlTboeC4jkSeNgDuZ5KaZLgyhTy8uPm53Wgy7LWM2bdKm0WM2Nx+gi2WsvFvVHJSVBLLME31PpstLhsOG3+KDZcA128/r7IlUx8jQyJ/mI46NCY2cxmYO2YFnKmKqNrlxl0NgdJmTA+QWswmX8lDfEVXD0ADVeymNwIlzvRou74JNWKMkgLi/E1Rgk6WDq50D0ugeJ8bvcYZUDupbdo7uePKPmsrnenFYl1TzOZMU2mwa0dgdzvvzyiOCyNzo6cDp6AbJpP0TyLpDsb4gxFSzXuvu6I/tbx6npsEOp5dVeZdcnk7lbDB+GjA4/XZG8HkoA2+f5BVsZ7sxmFyA2tHrb5IzhskA4n7/ArU08q7fkd9lepZaCBbt0CVhpSM7hcuAm3G31VujgjBtY9vktAMGB3hOa0TEAfT4pDugXh8tP6/XdFMPgABZWBGzQT9laZRebbfq6ZIv3ZoiTHZNqVAPKwSYPpPqrgwgm5VhrABYJWOjHYjCvJOqf+USyXLwG6juruLAKeyrDYVAkQVmji0J1LEcKnWLnFNY+HhvVIpBik4lT06ZXcPhYAJVmYUNlJHGhde8C5sBuVBicW1g1PMD7+g5WdzHM3VfK2zOnJ7n8khnc2zA1Tpb7gNv8AUep/BWMvw2kSVHgMHHmcrzHSeypCJE4BNCeAmI6E4LicEAdTgmhOCQzypv7R8E/3qdQf7qdM/UPUOK8UZVWEPYb/AP6z+EoLnXgJ7SfZknoPZuP1aIQYeFMX/wDid/6Th9SQlQX4aHN81y1waKb3NgXhjx92rKY7G0yIptsNz+fVKt4frtBLxoA3LgWD0lxgnsELdQPU/wBrvuig1MKYbNi0Q6SOOo+KJYbxVH/2y7oNWntexlZWsyBZ9/T/ACtDgMD5YIidzzPdNCbZcxHjKqQQ2noB4Do+sSVLS8bYoACnTpNjlwc8/wDcB224CHvwIkjoreCyMON7j6IHqdUS1PGOZVLCu5o50NY2P7Wz9VUpZFXrONSs5xLt3PcS4/G5K1WXZaxuzAY53/XK1WAykOhxTZKV8mOyTwyBBIJ+HC1+AygNjS38/mj+HwTW7BWw1o3hFlJLpA2hg+ys08H2VoPHCmpu7JWJooHDmyk/d7FWyukmEyaKFHCOPad1cpZc0evVPa8xCq4qtVNhb0SAtuexu8BD8Tm4Bhl1RdhXuMu+qkpYAhOgIauMeXXJHThS06lTkz6Kc4Jqno0hwExpFJ7HEiVZZRtcqy6mmPaEmwopZpimUKTqh2At1J2QbIfa1qwqvJaBcNHTa6jzui6tVa158jDMDkjqm5Zmhc6oynAAIAI3IFj6CVyvJqml0d0cOnE5VbNpWx7WDzuA9fwG5QbF+IDtSEf6nfg380Pbl73GXc8m6KYLJgLuK6EkcdgjS+oZcST1KKYDAgboszDNAsAq/siLlMRIKSeAntuu6UwGgJwC7C7CAEF0JBdCQxJwTU4IAFYvBMqCHNB/XVZXNfBVF8nQfST9zsto0KQtEJtEnjWZeCqzL0gxreL6j9AAspUwji8sLS4jk2v6Be8Z3g3lpFMhpI3ifVBMq8NUsOHVXXIBc57uwkkBSVZ4ti8NoJBBLhuAIA7HureS5tH8N4kRAIsGX5V/Gua91Sq/3i4n1kyfugVdkuBAAA2gQBHQfiUcD2ZpxREzuemy0OW0dQE7/L0CzOXY4OgyAYvP3utJldUa51WA2mdvRVsSk3sajLMIBeFoMNQA5WYo5wdQbTbfmeEQ9s+p5Qbc9/8ACjVq4NXjcI2y/i8yHu05PfhZrNqtXWHeYhvE2J5sPx7rUYfDNaBIuu4nCk3BhOULQoZNLujO4bPQwAvsf1yjVDOWH+dV6uWTuAfUA/dRvy8jdgP0UpSRTljfQQOfUr+YW+sf8gJpz9nUWn7x97ITUwTOWlvoAVUdkrC6Q9scja/G/ZJymugUcT7NIzPae0j594TzmzJi3PI43WZd4fPH3iw2Cq1ckeCSC6bDeRfdH1GuivpY3/I2H/izdrJpzLssa/KKgM6ibnnsqnsqoABcZg9f5Sj6y7Q/098SPQjjhbb5qajjmckfdecYmrVa0mZ5F/mPuu0se9rr7SB8HCR+SHmiNfFl6bXF5tVLoYABeXG5PSANgmVMe6wDpPJ0gfIKLJ4qt77FFqWWtbfdOO6sxn+114CMzw5MtaYc4QO0rO5dhXYeownrB/H7n5LY1sHqeh2a4aZa63R/Q8T+axnh7XJ1YPlaVofDNNhgHAFTQg+R4ryhjrOCMyuhbo45KnQ1RV/NHZSuTYTJONCeFwBOATASS7CUJDOLoSSQAl0LicEAUWvGymaVDVpHhMbVIVElyEOz3/ynN0zqER1/UBWmYoLO+K8zc2m5wIbFgTx1MKXsM8fzFoFQNJ2Jm1y6Ts381BWbA9eOT69AmPxDnVHOadRJJLzufT/Cs0KOo6jMdTz6KbLoho0jvxx3PVa7w7gDG0koXlWBL3bWC3eV4PTYe9YT9YUSbeyN8cVFapE2EwbQYAkncrS4PBBrQSo8BgIgndFW0r3WkYqKMMmRzdspOpzdJ5Vus7cBUmGHXVmY+jTlTikF0BWGUpCVjKFXDA8KpVy1h9UWNNVqzoQAJOWEe6SPimuo1W8z63RVr5UoagAEXm2pgt0URpUzHEGb91pPYg8KtXy9h4UuKY06M7Xy8RIAdExzY7hBMfhvLEW934Hb5Fa+plhHulUa+DMFrm2PI3WcsdmsMriUfBtYy4EXET9R+H1W1KzWEwzWu1M5iRzK0jNgqxx0xoWWanLUhjGKPEYcOFwrAC7CsyBeGwpa4fT0RYLrWp4CBjIXIU2lMIQAyF1JdQAkkkkAJJJJACTgmroQA1zVC+muJJoRDWYADx3C8r/aFiQHaTLrWBJIns3k95jskklIa5MTh6XL/g380bwOGqVCAGl3QDcpJLJnTBKze5NkxYwF4828DYdu60GEwpHm+iSS0gkjDJNyYZo4kWER6qUvSSVGY0NlV8RTlJJCGKjUO3KtNxBCSSbAfUrWVF5LkklKBlcSFNTrdUklQidlUJxqhJJJjI23Mp5pg7hcSQBWq4ETIV2m2wSSUjH6V0NSSQA8BcXUkAJcKSSAOELiSSYCSSSQAkkkkAJOCSSAP//Z',
    tags: [{ text: 'PHỔ BIẾN', type: 'popular' }],
    rating: 4.2,
    reviews: 42,
    price: '45.000đ'
  }
];

const AI_SUGGESTIONS = [
  {
    id: 's1',
    title: 'Thịt Bò Hữu Cơ (Top Choice)',
    desc: 'Thay thế cá basa để tăng cường sắt và kẽm.',
    tag: 'Giàu Protein',
    price: '125.000đ',
    image: 'data:image/jpeg;base64,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',
    type: 'large'
  },
  {
    id: 's2',
    title: 'Súp lơ xanh',
    desc: 'Nhiều Vitamin K & C.',
    price: '15.000đ',
    image: 'data:image/jpeg;base64,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',
    type: 'small'
  },
  {
    id: 's3',
    title: 'Quả Bơ Sáp',
    desc: 'Chất béo tốt cho tim.',
    price: '32.000đ',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop',
    type: 'small'
  }
];

export default function SearchScreenMain() {
  const router = useRouter();
  const { query } = useLocalSearchParams();
  const searchQuery = query || 'Cá basa';
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Tất cả sản phẩm');
  const [cartCount, setCartCount] = useState(0);

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'suggest': return { bg: '#D1FAE5', text: '#059669' };
      case 'discount': return { bg: '#FFF7ED', text: '#EA580C' };
      case 'organic': return { bg: '#F3F4F6', text: '#4B5563' };
      case 'popular': return { bg: '#D1FAE5', text: '#059669' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>NGUYÊN LIỆU CHỌN</Text>
          <Text style={styles.headerTitle}>{searchQuery}</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
          <ShoppingBag color="#059669" size={20} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Results Info */}
        <Animated.View entering={FadeInDown.delay(150)} style={styles.resultsInfo}>
          <Text style={styles.resultsTitle}>Kết quả phù hợp</Text>
          <Text style={styles.resultsCount}>{SEARCH_RESULTS.length} sản phẩm</Text>
        </Animated.View>

        {/* Product List */}
        <View style={styles.productList}>
          {SEARCH_RESULTS.map((product, index) => (
            <Animated.View key={product.id} entering={FadeInRight.delay(200 + index * 100)}>
              <TouchableOpacity style={styles.productCard} onPress={() => router.push({ pathname: '/product', params: { id: product.id } })}>
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                </View>
                <View style={styles.productContent}>
                  <View style={styles.tagRow}>
                    {product.tags.map((tag, idx) => {
                      const style = getTagStyle(tag.type);
                      return (
                        <View key={idx} style={[styles.tag, { backgroundColor: style.bg }]}>
                          <Text style={[styles.tagText, { color: style.text }]}>{tag.text}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                  <View style={styles.ratingRow}>
                    <Star color="#F59E0B" size={14} fill="#F59E0B" />
                    <Text style={styles.ratingText}>{product.rating} <Text style={styles.reviewText}>({product.reviews} đánh giá)</Text></Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>{product.price}</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => setCartCount(c => c + 1)}>
                      <Plus color="white" size={16} />
                      <Text style={styles.addButtonText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* AI Suggestions */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Zap color="white" size={16} fill="white" />
            </View>
            <View>
              <Text style={styles.aiTitle}>Gợi ý dành cho bạn</Text>
              <Text style={styles.aiSubtitle}>Lựa chọn thay thế tốt cho sức khỏe</Text>
            </View>
          </View>

          <View style={styles.aiGrid}>
            {/* Large Card */}
            <View style={styles.aiLargeCard}>
              <View style={styles.aiLargeImageContainer}>
                <Image source={{ uri: AI_SUGGESTIONS[0].image }} style={styles.aiLargeImage} />
              </View>
              <View style={styles.aiLargeContent}>
                <View style={styles.aiTag}>
                  <Star color="#EA580C" size={12} fill="#EA580C" style={{ marginRight: 4 }} />
                  <Text style={styles.aiTagText}>{AI_SUGGESTIONS[0].tag}</Text>
                </View>
                <Text style={styles.aiLargeTitle}>{AI_SUGGESTIONS[0].title}</Text>
                <Text style={styles.aiLargeDesc}>{AI_SUGGESTIONS[0].desc}</Text>
                <View style={styles.aiPriceRow}>
                  <Text style={styles.aiLargePrice}>{AI_SUGGESTIONS[0].price}</Text>
                  <TouchableOpacity style={styles.aiArrowButton}>
                    <ArrowRight color="white" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Small Cards */}
            <View style={styles.aiSmallCardsRow}>
              {AI_SUGGESTIONS.slice(1).map((item) => (
                <View key={item.id} style={styles.aiSmallCard}>
                  <Image source={{ uri: item.image }} style={styles.aiSmallImage} />
                  <Text style={styles.aiSmallTitle}>{item.title}</Text>
                  <Text style={styles.aiSmallDesc} numberOfLines={2}>{item.desc}</Text>
                  <Text style={styles.aiSmallPrice}>{item.price}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating AI Button
      <TouchableOpacity style={styles.floatingButton}>
        <Zap color="white" size={24} fill="white" />
      </TouchableOpacity> */}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40, 
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultsCount: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 4,
  },
  reviewText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  aiSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  aiGrid: {
    gap: 12,
  },
  aiLargeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  aiLargeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiLargeImage: {
    width: '100%',
    height: '100%',
  },
  aiLargeContent: {
    flex: 1,
    marginLeft: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  aiLargeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  aiLargeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  aiPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  aiLargePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  aiArrowButton: {
    backgroundColor: '#22C55E',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSmallCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  aiSmallCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiSmallImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiSmallTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  aiSmallDesc: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
    height: 28,
  },
  aiSmallPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    height: 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navCenterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#059669',
  },
});
