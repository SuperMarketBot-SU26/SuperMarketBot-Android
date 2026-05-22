import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, BarChart, ChevronRight, Clock, ShoppingBag, Sparkles, Users } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const INGREDIENTS = [
  { id: '1', name: 'Cá basa', amount: '500g', image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=400&auto=format&fit=crop' },
  { id: '2', name: 'Dứa (Thơm)', amount: '1/2 quả', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop' },
  { id: '3', name: 'Cà chua', amount: '2 quả', image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?q=80&w=400&auto=format&fit=crop' },
  { id: '4', name: 'Giá đỗ', amount: '100g', image: 'https://cdn.tgdd.vn/Files/2019/12/17/1227098/loi-ich-va-cach-lam-nuoc-gia-do-don-gian-tai-nha-201912171044280351.jpg' },
  { id: '5', name: 'Me chua', amount: '50g', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhMTExEWFRUXGBcXGBcYFxkYIBsYGBcYGBoXGBYaHSggGBooGxgbITEjJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGjUlICYvNS8rLS0tLS0tKystLS0tLy0tLS0tLS0tLS0tLS0tLy0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xAA/EAABAwIDBQUFBgQFBQAAAAABAAIRAyEEEjEFQVFhcQYTIoGRBzKhscEUQlJi0fAjM9LhQ3KSovEXJFOCwv/EABkBAQADAQEAAAAAAAAAAAAAAAACAwQBBf/EACoRAAICAgIBAwMDBQAAAAAAAAABAhEDIRIxIgQTUTJBYUJxgRQjkeHw/9oADAMBAAIRAxEAPwDuKIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiLyXBAekWvUxQG9ReK25BIDSAIlxgATwJNzyErjaR1Jsmy4cV4dXaN651tTtqWVMtMZ4E+K+e0w2Ihy08T2/eQ0twlZo+8SyI6OfDSfRVLPF6Lv6edWdMfjWjivTMWwkNm50B39OK4/X27Xr16ZBfh2ZXXqVWmTuIY0m0fP1m6nbEU3UgCKhc2JPhBIuSN8x81H31Z3+nkdMRVXs32zpYh/dEOY+CQTo6DpPHfCtIKvjJPaKZQlF1JH1ERdIhERAEREAREQBERAEREAREQBERAEWvjcYyk3M8wNOp4Dmqm/tZTeXuBllMXIIy5joyZmYuYH6GMpxj2SjCUui5krTxu1KdIEvcGjiSB89VR6/aKo5rW5u7NQnL4SCBMAEG8zr5cbRGJ2Iasd5iakcGZR55y0nf/AHUOba8V/ksWJJ+bJ7bXtEoMnLWEDhTc74uLQPioLAdosZi3l1J7hQBg1XOaGniGAMBceh81o7RwGEwNPvO5NZ5Ph71xd4oJ32Asdy59tzb2JqEOe97ReAJa0AbmgWhUNyvb3+LNkMePj4r+WdU2xjcTTfma8Ghlhzh4nsd+Ms++3SwIhRXe4aq6lTrbQ757jZrfDmOoEwcnrdc52disSCKgq1BH5jHSCbqaG18PUqUnvollZj2uzUsviLXA3aSBu1+a65QbtnPbklSL/ju6wuV7W53RFOlmLabG6APaLvcI90DdqFVNv0q1Rhql+Zzok6BoJFmg6NCxduO0svc8Q105mtN4BED4clp4DbjqjWUTJcWuI6XMO3npvhMiUnvoY7itdmRrnOLSLuAiNJiNDuNljzl+JpOktFNmY2vmfm3Tyb6rJhyffizRM9NwG+dLrwMb3Yfna573GcjGlxaIAA4AxuUJJKXiWxk2nZOYKs6nWZUa2IMQQQCDrlO47/VXOj2oNOq2AXD3SJOk6/vRUXYu1KlYgfZXtynNmfa8aQRqTdS9NoM5mmZ15cuAVjTq18lMmpNKXwdd2bj2VmB7DyI3tcNWnmFtLnHZbEPw9aZzMqWd0EQ48xJ6yujq+EuSMWSHFhERTIBERAEREAREQBERAEREARFjxNXIxzj91pPoJQFC7ebRfVc6hSqd02mAXVr+8CCWti/K2+3WtbP2jTyimGVH5HwKjoOYzd8HfO+8cgFA7Y2tiMTiQHMNIEGCRZrAJc8NIuZ3mbkb1g2fif5oBMNblaTciCZfbeZPK687Jn8uR62L0648WW7G4Qvc9r2SHNDQAYsNSXC4vz3c1XtlY12FrCmzEjEUC4tgHN3Z/Dm0Jg7j5BV1+Or5ajQ5+QzMkxHPqo2hjKoYA2QGTEkkCSSYbuPRS91yj49hYVF+T0dL7U7Vw89xUIGYXefEGOixhVDCYFvd5RQrV9xLWOeM2pLSLDqNVWqGNewuc4ZwdcyksJtTJBpmLCSCRruMb0inFW9nKX0obXwmMaAPs1YU900nCx0k6ApsnYOIcO87mowgg5qmVjYm/vEFTlDbdR9MkPqGDvJgRB00KlsJnrUWufElvim/qrYKHwQm8i1ZCbV7ON77PVr0gXBrWiHP91oBOVo6LDiNl1abg+nkcQJDhAMDk6/yVvxDqbKZORpLROZ37sFVcT2icfDnbSmYOthrBOk6eqOaeqIRTTuz1UxVYfdo7iXXfeLeGwm/Ejks7KAYW1JzVXCTUdaOTWizfILUpObUbNs++Lb9YWznmmc0yLCPqqeKtV/Jp5NJsmtibTZlc2rUDdeRnWY3mymMES+S1w8wRPO/7uqBkFQwIEAm54D5qz7O2l3dLLa0fEKzNNwSpFGOCyN2WKnimtLm5gakm0iT5eS6XhQQxgdrlE9YuuLYCq01RVgHIcxneAbnqu2gq/E7Rm9RHi0fURFaZwiIgCIiAIiIAiIgCIiALBj6WalUaPvMcPUELOvFb3XdD8kYR+c8HSewPLwQ6TPMAw3rJcdd0LMzB6vZDXODcw5ixjmpLtFiqdGkatMZn1Q0si+usbhBEeS59RL6hGcujdfQa/NeXHHVqR7MsnKmi57b2e52Hp5Pcvn5wdJ42VfxGHbEtgyYygzlAi7t88ty29mY+o6nVY+oSyHQ03khsjz3rZ2Ps5oYahIaDMc7XUZTjj+k7GLl9RUNoSHQBAG4LWoai0zwVg21hw14bAJcYHPXdwUZiMFVBkeMEC7f0stOOXKJVJJMltk4xjG1WuaAYHCQDYgAn9+antm7UYGMl0gtBIaCROio2JNQgU3Hw6m3SROpiPXyU9gP5LIFoU1S0Vu5bJPH7X72p3TZ7sC7v1HBYBgKZf4pibX03yfj6rEacXI1g9QvuEonM+oTuEA7hYW81VPG3uLLITj+pEhiaNNj8rSCYkkcxv8A3uXmoNTIvuhYKNCXCNTxP1Uph8HSzAOrXuA0cY4pxaVt9Ek0nRqUqzabwDleyLiJ1GoneNPVMG0uLg3UkR0mPS6947AlviAstfDOImNY16LqnzjaOvHxbsmdn0i2oGOG8Aj8sgld2abCNFwnYwL30i5980niY0Xbdl1M1GmfygelvotOIweo+xtIiK0zBERAEREAREQBERAEREAQoiA4vtLY7KdTFMcTlZWzUwYLQ5waXUyDq069JK581wpvqOFr5mN5EnwwdQuo+0rC56xZPiMvptzAZnsymPzGLeio2x8Iyu6oXgsyWaTJg/hg7/kvP9Q+Dt9HqYPOP5NfA4ijDc47s3ABmJI0JAi4XirtQMaWudJGjBxmB0Cw4xw7x4zZmgRD2hwidwOh5hRtTZ1ZpzNp+EzBiLdFD+3JIu4ziSdChWruknxRJge638PpFhxusmOaynTAa6XNkGTp0jXj5ra2YKmHpMzujvQWunW5zeSgO0dw3KDJJndoGgfMjyCvhBrZRKcX4kXiq0nw6KwbLr/wmthVR7S1WPYb5pjzUuB33PsiUbcht16LbgEyAvrKxizQJtP915eCDlkE205rqtshKktGNrSXcglTEQQRqNI4qQZhxTPidDSYjkblp8lMV6NOpSDadFrRJkxe2+VnyeohGXEshim48j7Sf39IEWnVvNRNenkJaLz8+PzWc4Ej3CY4c/JY2YGq98ZCAfvbuEyqsMKk+L0aZT8fLsl+ydAl5cLhoJ/QeoXYdhg9xTkRY26klc52DgclK2pysbzvJPqulbK/lNvMSJ6Eheji1o8n1DTdo20RFaZwiIgCIiAIiIAiIgCIiAIiIDm3bDDNxOKr0KoGSnTpPa4ase4vnzIAMcAOKolH+Y0OOUgukQJcSPeJ371ee3dXuqtQhsd5UpSeIFIQT5j4KibRqE188DwiDztqOa871MXLr7X/AKPU9M1Ffv8A8zRq4RrnugeFup4kLLj6r25WtdBE5Xcp/svuIIMZNTqOC0cRSqPMMgcXmw8hvWOGNur7N3uKMtdHmmx9VjnVahflIgndMjcI1uvuJp95TDQ3O+BYWAzRE8dAZWejlLHUL5g1pmbATcHrOut1qUK9Sm5rmeExlcbXAO+dTeF6qjyjTZ5kppZHJI0KOzw69QX/AAj6rdwBZRcKbGuLnBz+NhE26fIqv4zaFWq9zWyBJgN66k6lbGxqTu+a92YxYkncREXRqKVMlFzk7RZ6RFR7QABm4zHWAtmlRpsdD3AvmIFgBxk71hrUA2fDke2Hak2NxHPT1Xx2VhDZBdq799VFTiloSxzbqTPW18A91RhBlhMkSLE7+imqeJaykWjUDr8Vq7Ncxwccu8Cdeo5LT7SVX0qYc3e4tnWOqy5cDlJTXXwXxyquBIYHGwQMtnGdB6wrLhXsc29gbiOJGvJVOlT72nTeC0ZWyXHSTHx19VL7NqjdZo0jS6oeSpJxJPD4uycwtQgszGHNMNG7eQfj6q69knk0SHEEio824OOb6x5LneJq/wAHvAJLXi3EC2vr6K5dgccajakm4iRzvcevyXqY8nKjzsuNpNltREV5mCIiAIiIAiIgCIiAIiIAiIgKX7RdlCrTu/uzLSHbpBjK61gZ13TK5ptaiynVex3gcLmTaNfRdT9op/7fIBJfDR1Lm2XL9q4I4inSfUYRUAA1tUpicryd7CAQd8g8VRkjbNeCdKmabq9JhFwSbAtvmMCzeOo9VpbdwtZgAcyqwOOpEehFl5ds5wDnBrS+ZY60MG8ZIIIgDhCkRjC9ga90Z2gjLIHDSeIKztqrga1d1MgtlU+7cDPvGDzbMX48fILz2nw8MyyNQ7rx66/Bbv2X+IN4G7ovW3cJDNOv6qDySg0i1Y4yKhhMQ+mXBhHiEGQPmdFZsHWIpskAiJgcSLmyrlSgQRzIVg2WJZFhBieF9VeqbsofJdG8zFBxcHQARqTwEi/ktMta4l7XB062iIERw9Fp9oaRNEZZLi4TGgE2jfqvmGw5ptHHUxx3q6EEZsmRt7JfZ2GeXgiWibm8HlbVTe0MG6oyowAO1IFpmxEA2C85u/pU3O3Q7o4SPIa+qx4XGaiZdIAOlhO/jdcyNRO4k5bMPcFtNrXDJZoueY4DiY0WRtSo3wGbaQZaB8vqsWJxbyZLSZEAwbL3iDlaATLoAMcY1WVpPpGyMmuyd2fixkLDd2p/Tn/dX/sJQAY9wAvGnnK5dgqtxGu8m3oup+z+qHYcwZIdc+SuwpKVIy+pvjZZ0RFqMIREQBERAEREAREQBERAEREBVu3hHdtBjjJ4zH1XPe0INKwt3ni5ARIAH3RJeepKvvtHwYq0GtMwTBItAHin/auVV9vR9nNcfw306jTYuIFNxYx0i9zy3lVTV6NGLVMi62Pa1rg12YaGNJNgAefLgtahtdtMU6Bh1PTMdWv3kO/CT/cLeq9oKJAYcP8Aws4LSYBGkujcBPwUTtvB0muyVSQCTlLRrc30Kgo1+S9yb30WKrVyVC7wOB1yG0HgvmPewsBaZvcFRWzBRaAxtTMDpvgxpyWy5o/4Vbxxk7LVOUV8mnW2YHe7HGD9F8wTe7c5vrvut9hMTpZRppu7wu5n4qppqRfacbN2nAtEzxTGYFwEmwPBbNOjkp964W013r79pFRsEdF2OWV66K5YoVbMmYd1kp5jDBu/NeefRR9Jsj3oHJeqe0XU6oYG/wAPIc3GSbX6A+qEsdJpuDoMEQSQSAbjXzCulG9sohPjpGWm4wAS6JtaBz69FsEF4ENHhF3cd8klYKZk6OGtg1x06jn817rEkhjGEHUlwiAd8b/3ZQ5pOi6MJNWbFKLb4g/VdQ9nDrVByaY6qk7LpMpt7t0vcRMGNeJHpYK/9gW+CoTBMgEgcZKthHyTM+adwaLYiItBhCIiAIiIAiIgCIiAIiIAiIgK92ypF9LJMB7ajZ4EsMH4Lim2Nguc6lNQABjWtEEwwCNRxIJPVdv7VYnLTENDnTIaSBNiIBK5dtEBtVod4CGzkJkgGbW4aqE9mjC6KgaYeX08ouCWaXc3cD0Xmln7giqabsv+HUcWvjdlJbB4ag2WfaeFAd4feEkWkybyNFgPeVKbm1RP4TEHUfBZ1paNb8nTIB4eyoWhrg68tdfXSRxghT2z6NYS5zCRoADMkgwZ4Lb2fs1/dS0AnxXMa6yd82+K94nEVKVKiIOUFzTO6SQ3/bCsSqiiUu0YMBhKtUvZUEaeETDdZvvJW9tDCtDWllptl4QFsteyk3PqdHEXv1+K+0a7KssaDOpLrX3RG9JwTX5O4sjT/BE7bxZeKNNggNbfmZuF6pABgDbrYxAczKDeZ8iePosFKZnRZowcXTNTkmtGttJ4EEDxEQB5arW2ew0yHkST73H/AIUjj2tqNdDfEB4TC1cBQfEOG/U8FZJ3orjGnZN7PxPhee8iYbHGbrNh35cz9R93m7ko3Z2zHF0jjIJ3c4UrSwphoiCLEzMmLnkq4Ncts0ZL4UjDSc58QCXT563Pkuw9jYbRy2zTJjjAkHn+q5lg6BD3AN8RAvmaN33Qb+cbleezgOFA7xxIJvO6Rr8pha4M83MvkuiL4CvqtMwREQBERAEREAREQBERAERY6z4FtUBS/aHhg9jwWkhzRHJzbj108xxXKcbi8V3jcgHc5aYHeXDGkBpIf7zYm+4DWdV2PtTVDW/izODekgyfLXrC53tRrmPDcrbWJJPi108j81VJbs1YpeNFeq49wcWGlUL2/hAN97ZgtMbylLGVXtOeiGDQAmXHmTAj0UgKmXxEQLmREDjMLDiHtjxVAANL8b7lGy1L7mXYjrPbv94DqCD9PVfdpUnd0W6tEHTSLLFTxGYtdTY12XXKYMGdQevwU1h8WwwZ5HfqNLalS7RU3uyGZhHOo5mtIBZwPvcf8v6rBhMC5haSREzoR4teF4n4nirC9rm2ExM/VR9aqWguIkiTx5ribt2S46VHrEYMPl2hBg85URiMK6/dnMRqBv6cSs1HEVqhcQCBI3DfzPBMGzENOV1wTOoBE7je6i4/dElL9LMVDDVX3LSLAXhultNSs9LZ5F3GeknqtujUc10ElxPoB9TzWVz3CIm/PTyP7soZI2viyeLJT+T5hq4piCI5x9Vhpd69x7sEl1yd191/mtyt4rk2G6/xWzTkAAG2kfToq8eJY9/csyZPcZ5Y2oxzHwCWgX105+as9Ku51B7iJcJLZ4wA3TW581FbPcA9rDofopqo50h7GlzWkHKL2Ez9Cr8dpNmfNJSaRbuz2b7NRD/fDGh3UD9FIrS2e8xBEH58+S3VeujG+wiIunAiIgCIiAIiIAiIgC1K05r6LbXioyQgKt2nDSGsIkkH0/W1uirFR4eMrg0mIg8fK48lZe09EhzajgYAgER5g7iDrfgqtiqkHOGeF1yQLjnzVUtl8NIhNobJdPhfmbHuOvFo0+8L66qN2fS7qrDXNYDq10ZSb/yyfd6ag8RKuUU4kQSo3GYdrpljSee+NJVDvtGiLvTIXalBuZxeS55twsJAkcFHYF7mktyg7zbQcLesqR7iqwONJzMsxkJztHEaktHIEaKPdtgB38toe2cwkkTxBtI6rspNq46JwjFOnsk6DnBsklpv4T1OsrHUxYa3MSB6ct2+yxVtu0qjZIOePL1UFVxbSZdMiQ0Wgee9dU+X7nPb4O/sTI2u2L+WgI+hW5gdq0n6ObmHE/JVrEV6TrGx8omFFVrOlp03iyt30UtouLMaHOcJMg6kGDPAreqVKhFrC0mwmNZJOmipmE2s5gcS50xZs2ProsWztqvdVd3jnFzyIEyAB90CdF2Sb7IJpFvZUBIBOYHTgDzW1Tplxggkf5jHoo/D1Wt8RcBvgwPQLJiNqDwimMznRAgn0YLlQdliaJsUxPhmxEHUTAOvl8Fc+z7/ABS7TK2Op1+QVW2fsrG1Qw5HUhwqNyDzaBJV42bhDTYATJi5AgeQ3KyJVkaJWg+4PNSCimE8D6KTpmwlTKD0iIgCIiAIiIAiIgCIiAIiIDxWoteC1zQ4HUESoWp2RwhOYUcp/K5zfgCp1FykdTaK3V7E4U+6KjDxbUM/7pWjW9nlB0/9xiBP5mf0K5InFHeT+SgYP2UYWlOTE4oSST42akz+BbFf2X4N93VK5PEPaCeuVgV3ROKHJ/Jz9/sjwR/xMR/rb/SvFb2Q4J3+LXHRzP6F0NFzivg77kurOZ/9FsFM/aMT/qp/0L3/ANGsH/58R/qp/wBC6SikQOcD2N4HfVxB/wDdg/8AhbOD9kOzabg4NrOI/FVP0AV+RDtlXw/s92cwz9lDjxe+o/4OcQp3BbMo0f5VGnT/AMjGt+QW2iHLCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiID//Z' },
];

export default function RecipeResultScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartMarketBot</Text>
        <Image source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }} style={styles.avatar} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.heroSection}>
          <Image source={require('../../../assets/images/canhchuacabasa.jpg')} style={styles.heroImage} />

          <View style={styles.heroOverlay}>
            <LinearGradient
              colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
              style={styles.heroCard}
            >
              <Text style={styles.recipeTitle}>Canh Chua Cá Basa</Text>
              <View style={styles.recipeMetaRow}>
                <View style={styles.recipeMetaItem}>
                  <Clock color="#059669" size={14} />
                  <Text style={styles.recipeMetaText}>35 phút</Text>
                </View>
                <View style={styles.recipeMetaItem}>
                  <Users color="#059669" size={14} />
                  <Text style={styles.recipeMetaText}>4 người</Text>
                </View>
                <View style={styles.recipeMetaItem}>
                  <BarChart color="#059669" size={14} />
                  <Text style={styles.recipeMetaText}>Trung bình</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.tipsSection}>
          <View style={styles.tipsCard}>
            <View style={styles.tipsIconBox}>
              <Sparkles color="#059669" size={20} />
            </View>
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Mẹo chọn nguyên liệu</Text>
              <Text style={styles.tipsDesc}>
                Hãy chọn cá Basa có thớ thịt chắc, màu trắng trong để bát canh có vị ngọt thanh nhất.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Ingredients Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.ingredientsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách nguyên liệu</Text>
            <Text style={styles.sectionSubtitle}>8 món</Text>
          </View>

          <View style={styles.ingredientsList}>
            {INGREDIENTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.ingredientCard}
                onPress={() => router.push({ pathname: '/search', params: { query: item.name } })}
              >
                <View style={styles.ingredientImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.ingredientImage} />
                </View>
                <View style={styles.ingredientInfo}>
                  <Text style={styles.ingredientName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.ingredientAmount}>{item.amount}</Text>
                </View>
                <ChevronRight color="#9CA3AF" size={20} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
      {/* Fixed Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.confirmButton} onPress={() => router.push('/cart')}>
          <ShoppingBag color="#FFFFFF" size={20} />
          <Text style={styles.confirmButtonText}>Xác nhận nguyên liệu</Text>
        </TouchableOpacity>
      </View>


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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC', // Match background
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 24,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  heroCard: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  tipsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipsIconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  tipsDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  ingredientsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  ingredientsList: {
    gap: 16,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  ingredientImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginRight: 16,
  },
  ingredientImage: {
    width: '100%',
    height: '100%',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
